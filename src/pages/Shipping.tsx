import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SqlQueryViewer from "@/components/SqlQueryViewer";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Shipment {
  shipping_id: string;
  tracking_number: string | null;
  order_id: string | null;
  courier_service: string;
  shipping_address: string;
  status: "processing" | "shipped" | "delivered" | "cancelled" | "delayed";
  estimated_delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

const Shipping = () => {
  const [sqlQueries, setSqlQueries] = useState<Array<{
    id: string;
    timestamp: Date;
    query: string;
    duration?: number;
    source?: string;
  }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<Shipment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>({
    tracking_number: '',
    order_id: '',
    courier_service: '',
    shipping_address: '',
    status: 'processing',
    estimated_delivery_date: ''
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

  const { data: shipments, isLoading, error, refetch } = useQuery({
    queryKey: ["shipping"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping")
        .select("*, orders(order_id)");

      if (error) throw error;
      
      // Use static SQL string instead of non-existent toSql method
      logQuery('SELECT shipping.*, orders.order_id FROM shipping LEFT JOIN orders ON shipping.order_id = orders.order_id', 'Fetch Shipments');
      
      return data as Shipment[];
    },
  });

  // Filter shipments based on search term
  const filteredShipments = shipments?.filter(shipment => 
    (shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || 
    (shipment.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    shipment.courier_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.shipping_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "delayed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewShipment({
      ...newShipment,
      [name]: value,
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingShipment) return;
    
    const { name, value } = e.target;
    setEditingShipment({
      ...editingShipment,
      [name]: value,
    });
  };

  const handleStatusChange = (value: string) => {
    setNewShipment({
      ...newShipment,
      status: value as "processing" | "shipped" | "delivered" | "cancelled" | "delayed",
    });
  };

  const handleEditStatusChange = (value: string) => {
    if (!editingShipment) return;
    
    setEditingShipment({
      ...editingShipment,
      status: value as "processing" | "shipped" | "delivered" | "cancelled" | "delayed",
    });
  };

  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newShipment.courier_service || !newShipment.shipping_address) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create SQL query for logging
      const sqlInsertQuery = `
INSERT INTO shipping (
  tracking_number, order_id, courier_service, 
  shipping_address, status, estimated_delivery_date
) VALUES (
  ${newShipment.tracking_number ? `'${newShipment.tracking_number}'` : 'NULL'},
  ${newShipment.order_id ? `'${newShipment.order_id}'` : 'NULL'},
  '${newShipment.courier_service}',
  '${newShipment.shipping_address}',
  '${newShipment.status}',
  ${newShipment.estimated_delivery_date ? `'${newShipment.estimated_delivery_date}'` : 'NULL'}
) RETURNING *`;
      
      // Log the SQL query
      logQuery(sqlInsertQuery, 'Add Shipment');
      
      // Add the shipment to the database
      const { data, error } = await supabase
        .from('shipping')
        .insert({
          tracking_number: newShipment.tracking_number || null,
          order_id: newShipment.order_id || null,
          courier_service: newShipment.courier_service,
          shipping_address: newShipment.shipping_address,
          status: newShipment.status as "processing" | "shipped" | "delivered" | "cancelled" | "delayed",
          estimated_delivery_date: newShipment.estimated_delivery_date || null
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Shipment added successfully",
      });
      
      // Close modal and reset form
      setShowAddModal(false);
      setNewShipment({
        tracking_number: '',
        order_id: '',
        courier_service: '',
        shipping_address: '',
        status: 'processing',
        estimated_delivery_date: ''
      });
      
      // Refresh data
      refetch();
      
    } catch (err: any) {
      console.error('Error adding shipment:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to add shipment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingShipment) return;
    
    if (!editingShipment.courier_service || !editingShipment.shipping_address) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create SQL query for logging
      const sqlUpdateQuery = `
UPDATE shipping
SET tracking_number = ${editingShipment.tracking_number ? `'${editingShipment.tracking_number}'` : 'NULL'},
    courier_service = '${editingShipment.courier_service}',
    shipping_address = '${editingShipment.shipping_address}',
    status = '${editingShipment.status}',
    estimated_delivery_date = ${editingShipment.estimated_delivery_date ? `'${editingShipment.estimated_delivery_date}'` : 'NULL'}
WHERE shipping_id = '${editingShipment.shipping_id}'
RETURNING *`;
      
      // Log the SQL query
      logQuery(sqlUpdateQuery, 'Edit Shipment');
      
      // Update the shipment in the database
      const { data, error } = await supabase
        .from('shipping')
        .update({
          tracking_number: editingShipment.tracking_number,
          courier_service: editingShipment.courier_service,
          shipping_address: editingShipment.shipping_address,
          status: editingShipment.status,
          estimated_delivery_date: editingShipment.estimated_delivery_date
        })
        .eq('shipping_id', editingShipment.shipping_id)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Shipment updated successfully",
      });
      
      // Close modal and reset form
      setShowEditModal(false);
      setEditingShipment(null);
      
      // Refresh data
      refetch();
      
    } catch (err: any) {
      console.error('Error updating shipment:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update shipment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShipment = async (shipment: Shipment) => {
    try {
      // Create SQL query for logging
      const sqlDeleteQuery = `DELETE FROM shipping WHERE shipping_id = '${shipment.shipping_id}'`;
      
      // Log the SQL query
      logQuery(sqlDeleteQuery, 'Delete Shipment');
      
      // Delete the shipment from the database
      const { error } = await supabase
        .from('shipping')
        .delete()
        .eq('shipping_id', shipment.shipping_id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      });
      
      // Refresh data
      refetch();
      
    } catch (err: any) {
      console.error('Error deleting shipment:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete shipment",
        variant: "destructive",
      });
    } finally {
      setShipmentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping</h1>
          <p className="text-muted-foreground">
            Manage your shipments and delivery tracking
          </p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              <span>Add Shipment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddShipment}>
              <DialogHeader>
                <DialogTitle>Add New Shipment</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new shipment
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tracking_number" className="text-right">
                    Tracking #
                  </Label>
                  <Input
                    id="tracking_number"
                    name="tracking_number"
                    value={newShipment.tracking_number || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="order_id" className="text-right">
                    Order ID
                  </Label>
                  <Input
                    id="order_id"
                    name="order_id"
                    value={newShipment.order_id || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="courier_service" className="text-right">
                    Courier*
                  </Label>
                  <Input
                    id="courier_service"
                    name="courier_service"
                    value={newShipment.courier_service}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shipping_address" className="text-right">
                    Address*
                  </Label>
                  <Input
                    id="shipping_address"
                    name="shipping_address"
                    value={newShipment.shipping_address}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estimated_delivery_date" className="text-right">
                    Est. Delivery
                  </Label>
                  <Input
                    id="estimated_delivery_date"
                    name="estimated_delivery_date"
                    type="date"
                    value={newShipment.estimated_delivery_date || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newShipment.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Shipment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipments List</CardTitle>
          <CardDescription>You have {shipments?.length || 0} shipments in your database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search" 
                placeholder="Search shipments..." 
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Tracking #</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Delivery</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading shipments...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-red-500">
                      {(error as Error).message}
                    </TableCell>
                  </TableRow>
                ) : filteredShipments?.length ? (
                  filteredShipments.map((shipment) => (
                    <TableRow key={shipment.shipping_id}>
                      <TableCell className="font-medium">{shipment.tracking_number || 'N/A'}</TableCell>
                      <TableCell>
                        {shipment.order_id ? shipment.order_id.slice(0, 8) : 'N/A'}
                      </TableCell>
                      <TableCell>{shipment.courier_service}</TableCell>
                      <TableCell>
                        {shipment.shipping_address.length > 20 
                          ? `${shipment.shipping_address.substring(0, 20)}...` 
                          : shipment.shipping_address}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${getStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatDate(shipment.estimated_delivery_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingShipment(shipment);
                              setShowEditModal(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            onClick={() => setShipmentToDelete(shipment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No shipments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <SqlQueryViewer queries={sqlQueries} />

      {shipmentToDelete && (
        <Dialog open={!!shipmentToDelete} onOpenChange={() => setShipmentToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Shipment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the shipment with tracking number "{shipmentToDelete.tracking_number || 'N/A'}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShipmentToDelete(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteShipment(shipmentToDelete)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editingShipment && (
        <Dialog open={showEditModal} onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setEditingShipment(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditShipment}>
              <DialogHeader>
                <DialogTitle>Edit Shipment</DialogTitle>
                <DialogDescription>
                  Update the shipment details and click save when you're done
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_tracking_number" className="text-right">
                    Tracking #
                  </Label>
                  <Input
                    id="edit_tracking_number"
                    name="tracking_number"
                    value={editingShipment.tracking_number || ''}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_order_id" className="text-right">
                    Order ID
                  </Label>
                  <Input
                    id="edit_order_id"
                    name="order_id"
                    value={editingShipment.order_id || ''}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_courier_service" className="text-right">
                    Courier*
                  </Label>
                  <Input
                    id="edit_courier_service"
                    name="courier_service"
                    value={editingShipment.courier_service}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_shipping_address" className="text-right">
                    Address*
                  </Label>
                  <Input
                    id="edit_shipping_address"
                    name="shipping_address"
                    value={editingShipment.shipping_address}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_estimated_delivery_date" className="text-right">
                    Est. Delivery
                  </Label>
                  <Input
                    id="edit_estimated_delivery_date"
                    name="estimated_delivery_date"
                    type="date"
                    value={editingShipment.estimated_delivery_date ? new Date(editingShipment.estimated_delivery_date).toISOString().split('T')[0] : ''}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editingShipment.status}
                    onValueChange={handleEditStatusChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Shipping;
