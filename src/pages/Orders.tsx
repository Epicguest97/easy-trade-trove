import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, RefreshCw, FileText } from "lucide-react";
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

type OrderStatus = Database['public']['Enums']['order_status'];

type Order = {
  order_id: string;
  customer_id: string | null;
  order_date: string;
  total_amount: number;
  status: OrderStatus;
  customer_name?: string;
};

const formSchema = z.object({
  customer_id: z.string().optional(),
  total_amount: z.number().min(0, "Amount must be a positive number"),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const),
  customer_name: z.string().optional()
});

const Orders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
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
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<{ customer_id: string, customer_name: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      total_amount: 0,
      status: "pending" as OrderStatus,
    },
  });

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

  const fetchCustomers = async () => {
    logQuery('SELECT customer_id, customer_name FROM customers', 'Fetch Customers');
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_id, customer_name');
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          order_id,
          customer_id,
          order_date,
          total_amount,
          status,
          customers(customer_name)
        `);

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter as OrderStatus);
      }

      if (searchQuery) {
        query = query.or(`order_id.ilike.%${searchQuery}%,customers.customer_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      // Build SQL query string for logging
      let sqlQuery = `SELECT orders.order_id, orders.customer_id, orders.order_date, 
        orders.total_amount, orders.status, customers.customer_name 
        FROM orders 
        JOIN customers ON orders.customer_id = customers.customer_id`;

      if (statusFilter !== "all") {
        sqlQuery += ` WHERE orders.status = '${statusFilter}'`;
      }

      if (searchQuery) {
        sqlQuery += statusFilter !== "all" ? " AND" : " WHERE";
        sqlQuery += ` (orders.order_id LIKE '%${searchQuery}%' OR customers.customer_name LIKE '%${searchQuery}%')`;
      }

      // Log the query
      logQuery(sqlQuery, 'Fetch Orders');

      if (error) {
        throw error;
      }

      const formattedOrders = data.map(order => ({
        order_id: order.order_id,
        customer_id: order.customer_id,
        order_date: order.order_date,
        total_amount: order.total_amount,
        status: order.status,
        customer_name: order.customers?.customer_name
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, [statusFilter, searchQuery]);

  const handleCreateOrder = async (values: z.infer<typeof formSchema>) => {
    logQuery(`INSERT INTO orders (customer_id, total_amount, status, order_date)
VALUES (${values.customer_id ? `'${values.customer_id}'` : 'NULL'}, ${values.total_amount}, '${values.status}', '${new Date().toISOString()}')
RETURNING *`, 'Create Order');
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_id: values.customer_id || null,
          total_amount: values.total_amount,
          status: values.status,
          order_date: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order created successfully",
      });
      
      setOpenDialog(false);
      form.reset();
      fetchOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrder = async (values: z.infer<typeof formSchema>) => {
    if (!editingOrder) return;
    
    logQuery(`UPDATE orders
SET customer_id = ${values.customer_id ? `'${values.customer_id}'` : 'NULL'}, 
    total_amount = ${values.total_amount}, 
    status = '${values.status}'
WHERE order_id = '${editingOrder.order_id}'`, 'Update Order');
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          customer_id: values.customer_id || null,
          total_amount: values.total_amount,
          status: values.status as OrderStatus
        })
        .eq('order_id', editingOrder.order_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      
      setOpenDialog(false);
      setEditingOrder(null);
      form.reset();
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    logQuery(`DELETE FROM orders WHERE order_id = '${orderId}'`, 'Delete Order');
    if (!confirm("Are you sure you want to delete this order?")) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('order_id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
      
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    form.reset({
      customer_id: order.customer_id || undefined,
      total_amount: order.total_amount,
      status: order.status
    });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingOrder(null);
    form.reset();
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch(status) {
      case 'pending': return "secondary";
      case 'processing': return "default";
      case 'shipped': return "outline";
      case 'delivered': return "default";
      case 'cancelled': return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingOrder(null);
              form.reset({
                customer_id: "",
                total_amount: 0,
                status: "pending" as OrderStatus,
              });
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingOrder ? "Edit Order" : "Create New Order"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(editingOrder ? handleUpdateOrder : handleCreateOrder)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map(customer => (
                            <SelectItem key={customer.customer_id} value={customer.customer_id}>
                              {customer.customer_name}
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
                  name="total_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
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
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    {editingOrder ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchOrders}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading orders...</TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No orders found</TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-medium">{order.order_id.substring(0, 8)}</TableCell>
                      <TableCell>{order.customer_name || "N/A"}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditOrder(order)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteOrder(order.order_id)}>
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
    </div>
  );
};

export default Orders;
