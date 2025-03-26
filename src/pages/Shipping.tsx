import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, RefreshCw, FileText, Truck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import SqlQueryViewer from "@/components/SqlQueryViewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Database } from "@/integrations/supabase/types";

// Define the shipping status enum type based on your database schema
type ShippingStatus = 'delivered' | 'cancelled' | 'processing' | 'shipped' | 'delayed';

// Define the Shipping type based on your table structure
type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

// Define the database shipping status type
type DatabaseShippingStatus = ShippingStatus;

type Shipping = {
  shipping_id: string;
  order_id: string | null;
  shipping_address: string;
  courier_service: string;
  tracking_number: string | null;
  estimated_delivery_date: string | null;
  status: ShippingStatus;
  created_at: string;
  updated_at: string;
  payment_status?: PaymentStatus;
  order_details?: {
    order_date: string;
    total_amount: number;
    customer_name: string;
  } | null;
};

const shippingFormSchema = z.object({
  order_id: z.string().optional(),
  shipping_address: z.string().min(1, "Shipping address is required"),
  courier_service: z.string().min(1, "Courier service is required"),
  tracking_number: z.string().optional(),
  estimated_delivery_date: z.string().optional(),
  status: z.enum(['processing', 'shipped', 'delivered', 'cancelled', 'delayed'] as const),
});

const Shipping = () => {
  const { toast } = useToast();
  const [shipments, setShipments] = useState<Shipping[]>([]);
  const [orders, setOrders] = useState<{order_id: string, customer_name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sqlQueries, setSqlQueries] = useState<Array<{
    id: string;
    timestamp: Date;
    query: string;
    duration?: number;
    source?: string;
  }>>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipping | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipping | null>(null);

  // Set up the form
  const form = useForm<z.infer<typeof shippingFormSchema>>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      order_id: "",
      shipping_address: "",
      courier_service: "", // Make sure this is included
      tracking_number: "",
      estimated_delivery_date: "",
      status: "processing" as ShippingStatus, // Change from "pending" to "processing"
    },
  });

  // Helper for logging SQL queries
  const logQuery = (query: string, source: string) => {
    setSqlQueries(prev => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        query,
        source,
        duration: Math.floor(Math.random() * 50) + 5, // Mock duration
      },
      ...prev
    ]);
  };

  // Function to fetch available orders
  const fetchOrders = async () => {
    try {
      // Log the query
      logQuery(`SELECT orders.order_id, customers.customer_name 
FROM orders 
JOIN customers ON orders.customer_id = customers.customer_id
WHERE orders.status != 'cancelled'`, 'Fetch Orders');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          customers(customer_name)
        `)
        .neq('status', 'cancelled');
      
      if (error) throw error;
      
      const formattedOrders = data.map(order => ({
        order_id: order.order_id,
        customer_name: order.customers?.customer_name || 'Unknown Customer'
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    }
  };

  // Function to fetch shipments with filtering
  const fetchShipments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('shipping')
        .select(`
          shipping_id,
          order_id,
          shipping_address,
          courier_service,
          tracking_number,
          estimated_delivery_date,
          status,
          orders(
            order_date,
            total_amount,
            customers(customer_name)
          )
        `);

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter as ShippingStatus);
      }

      if (searchQuery) {
        query = query.or(`shipping_address.ilike.%${searchQuery}%,tracking_number.ilike.%${searchQuery}%,courier_service.ilike.%${searchQuery}%`);
      }
      
      // Build SQL query string for logging
      let sqlQuery = `SELECT shipping.shipping_id, shipping.order_id, shipping.shipping_address, 
          shipping.courier_service, shipping.tracking_number, shipping.estimated_delivery_date, 
          shipping.status, orders.order_date, orders.total_amount, customers.customer_name
        FROM shipping
        LEFT JOIN orders ON shipping.order_id = orders.order_id
        LEFT JOIN customers ON orders.customer_id = customers.customer_id`;
      
      if (statusFilter !== "all") {
        sqlQuery += ` WHERE shipping.status = '${statusFilter}'`;
      }
      
      if (searchQuery) {
        sqlQuery += statusFilter !== "all" ? " AND" : " WHERE";
        sqlQuery += ` (shipping.shipping_address ILIKE '%${searchQuery}%' 
            OR shipping.tracking_number ILIKE '%${searchQuery}%'
            OR shipping.courier_service ILIKE '%${searchQuery}%')`;
      }
      
      // Log the query
      logQuery(sqlQuery, 'Fetch Shipments');

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const formattedShipments = data.map(shipment => ({
        shipping_id: shipment.shipping_id,
        order_id: shipment.order_id,
        shipping_address: shipment.shipping_address,
        courier_service: shipment.courier_service,
        tracking_number: shipment.tracking_number,
        estimated_delivery_date: shipment.estimated_delivery_date,
        status: shipment.status,
        created_at: new Date().toISOString(), // Add current timestamp as fallback
        updated_at: new Date().toISOString(), // Add current timestamp as fallback
        order_details: shipment.orders ? {
          order_date: shipment.orders.order_date,
          total_amount: shipment.orders.total_amount,
          customer_name: shipment.orders.customers?.customer_name || 'Unknown'
        } : null
      }));

      setShipments(formattedShipments);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast({
        title: "Error",
        description: "Failed to load shipments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle creating a new shipment
  const handleCreateShipment = async (values: z.infer<typeof shippingFormSchema>) => {
    try {
      // Log the query
      logQuery(`INSERT INTO shipping (
        order_id, shipping_address, courier_service, tracking_number, 
        estimated_delivery_date, status)
      VALUES (
        ${values.order_id ? `'${values.order_id}'` : 'NULL'}, 
        '${values.shipping_address}', 
        '${values.courier_service}', 
        ${values.tracking_number ? `'${values.tracking_number}'` : 'NULL'}, 
        ${values.estimated_delivery_date ? `'${values.estimated_delivery_date}'` : 'NULL'}, 
        '${values.status}')
      RETURNING *`, 'Create Shipment');
      
      const { data, error } = await supabase
        .from('shipping')
        .insert({
          order_id: values.order_id || null,
          shipping_address: values.shipping_address,
          courier_service: values.courier_service,
          tracking_number: values.tracking_number || null,
          estimated_delivery_date: values.estimated_delivery_date ? new Date(values.estimated_delivery_date).toISOString() : null,
          status: values.status
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shipment created successfully",
      });
      
      setOpenDialog(false);
      form.reset();
      fetchShipments();
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast({
        title: "Error",
        description: "Failed to create shipment",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing shipment
  const handleUpdateShipment = async (values: z.infer<typeof shippingFormSchema>) => {
    if (!editingShipment) return;
    
    try {
      // Log the query
      logQuery(`UPDATE shipping
      SET order_id = ${values.order_id ? `'${values.order_id}'` : 'NULL'}, 
          shipping_address = '${values.shipping_address}', 
          courier_service = '${values.courier_service}', 
          tracking_number = ${values.tracking_number ? `'${values.tracking_number}'` : 'NULL'}, 
          estimated_delivery_date = ${values.estimated_delivery_date ? `'${values.estimated_delivery_date}'` : 'NULL'}, 
          status = '${values.status}'
      WHERE shipping_id = '${editingShipment.shipping_id}'`, 'Update Shipment');
      
      const { error } = await supabase
        .from('shipping')
        .update({
          order_id: values.order_id || null,
          shipping_address: values.shipping_address,
          courier_service: values.courier_service,
          tracking_number: values.tracking_number || null,
          estimated_delivery_date: values.estimated_delivery_date ? new Date(values.estimated_delivery_date).toISOString() : null,
          status: values.status as ShippingStatus
        })
        .eq('shipping_id', editingShipment.shipping_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shipment updated successfully",
      });
      
      setOpenDialog(false);
      setEditingShipment(null);
      form.reset();
      fetchShipments();
    } catch (error) {
      console.error("Error updating shipment:", error);
      toast({
        title: "Error",
        description: "Failed to update shipment",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a shipment
  const handleDeleteShipment = async (shippingId: string) => {
    if (!confirm("Are you sure you want to delete this shipment?")) return;
    
    try {
      // Log the query
      logQuery(`DELETE FROM shipping WHERE shipping_id = '${shippingId}'`, 'Delete Shipment');
      
      const { error } = await supabase
        .from('shipping')
        .delete()
        .eq('shipping_id', shippingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      });
      
      fetchShipments();
    } catch (error) {
      console.error("Error deleting shipment:", error);
      toast({
        title: "Error",
        description: "Failed to delete shipment",
        variant: "destructive",
      });
    }
  };

  // Function to handle editing a shipment
  const handleEditShipment = (shipment: Shipping) => {
    setEditingShipment(shipment);
    form.reset({
      order_id: shipment.order_id || undefined,
      shipping_address: shipment.shipping_address,
      courier_service: shipment.courier_service,
      tracking_number: shipment.tracking_number || undefined,
      estimated_delivery_date: shipment.estimated_delivery_date ? new Date(shipment.estimated_delivery_date).toISOString().split('T')[0] : undefined,
      status: shipment.status
    });
    setOpenDialog(true);
  };

  // Function to handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingShipment(null);
    form.reset();
  };

  const handleViewShipment = (shipment: Shipping) => {
    setSelectedShipment(shipment);
    setOpenSheet(true);
  };

  const getStatusBadgeVariant = (status: ShippingStatus) => {
    switch(status) {
      case 'processing': return "secondary";
      case 'shipped': return "default";
      case 'delivered': return "default";
      case 'cancelled': return "destructive";
      case 'delayed': return "outline";
      default: return "outline";
    }
  };

  const getPaymentStatusBadgeVariant = (status: PaymentStatus) => {
    switch(status) {
      case 'completed': return "default";
      case 'pending': return "secondary";
      case 'failed': return "destructive";
      case 'refunded': return "outline";
      default: return "outline";
    }
  };

  // Format date string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchShipments();
    fetchOrders();
  }, [statusFilter, searchQuery]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shipping</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingShipment(null);
              form.reset({
                order_id: "",
                shipping_address: "",
                courier_service: "", // Added missing required field
                tracking_number: "",
                estimated_delivery_date: "",
                status: "processing" // Changed to a valid enum value
              });
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Shipment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingShipment ? "Edit Shipment" : "Create New Shipment"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(editingShipment ? handleUpdateShipment : handleCreateShipment)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="order_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No order</SelectItem>
                          {orders.map(order => (
                            <SelectItem key={order.order_id} value={order.order_id}>
                              {order.customer_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courier_service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Courier Service</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tracking_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimated_delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingShipment ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Shipment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shipments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchShipments}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Est. Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading shipments...</TableCell>
                  </TableRow>
                ) : shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">No shipments found</TableCell>
                  </TableRow>
                ) : (
                  shipments.map((shipment) => (
                    <TableRow key={shipment.shipping_id}>
                      <TableCell className="font-medium">{shipment.tracking_number ? shipment.tracking_number : "N/A"}</TableCell>
                      <TableCell>{shipment.order_details?.customer_name || "N/A"}</TableCell>
                      <TableCell>{shipment.courier_service}</TableCell>
                      <TableCell>{shipment.estimated_delivery_date ? new Date(shipment.estimated_delivery_date).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(shipment.status)}>
                          {shipment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {shipment.payment_status && (
                          <Badge variant={getPaymentStatusBadgeVariant(shipment.payment_status)}>
                            {shipment.payment_status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewShipment(shipment)}>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditShipment(shipment)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteShipment(shipment.shipping_id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SqlQueryViewer queries={sqlQueries} />

      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent className="sm:max-w-[640px]">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Shipment Details
            </SheetTitle>
          </SheetHeader>
          {selectedShipment && (
            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Shipping ID</h3>
                  <p className="text-base">{selectedShipment.shipping_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant={getStatusBadgeVariant(selectedShipment.status)} className="mt-1">
                    {selectedShipment.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                  <p className="text-base">{selectedShipment.order_details?.customer_name || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
                  <p className="text-base">
                    {selectedShipment.order_details?.order_date 
                      ? new Date(selectedShipment.order_details.order_date).toLocaleDateString() 
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order Amount</h3>
                  <p className="text-base">
                    {selectedShipment.order_details?.total_amount 
                      ? `$${selectedShipment.order_details.total_amount.toFixed(2)}` 
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
                  {selectedShipment.payment_status && (
                    <Badge variant={getPaymentStatusBadgeVariant(selectedShipment.payment_status)} className="mt-1">
                      {selectedShipment.payment_status}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Shipping Address</h4>
                    <p className="text-base">{selectedShipment.shipping_address}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Courier Service</h4>
                    <p className="text-base">{selectedShipment.courier_service}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Tracking Number</h4>
                    <p className="text-base">{selectedShipment.tracking_number || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Estimated Delivery</h4>
                    <p className="text-base">
                      {selectedShipment.estimated_delivery_date 
                        ? new Date(selectedShipment.estimated_delivery_date).toLocaleDateString() 
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">{new Date(selectedShipment.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm">{new Date(selectedShipment.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setOpenSheet(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setOpenSheet(false);
                  handleEditShipment(selectedShipment);
                }}>
                  Edit Shipment
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Shipping;
