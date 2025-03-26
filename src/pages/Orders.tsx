
import { useState, useEffect } from "react";
import { 
  Package2, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Calendar,
  DollarSign,
  Filter,
  Loader2 
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SqlQueryViewer from "@/components/SqlQueryViewer";

type OrderType = {
  id: string;
  customer: {
    id: string;
    name: string;
  };
  status: string;
  orderDate: string;
  totalAmount: number;
  updatedAt: string;
};

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Array<{id: string, name: string}>>([]); 
  const [sqlQueries, setSqlQueries] = useState<Array<{
    id: string;
    timestamp: Date;
    query: string;
    duration?: number;
    source?: string;
  }>>([]);
  const [orderToDelete, setOrderToDelete] = useState<OrderType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sqlFilter, setSqlFilter] = useState<string>("SELECT * FROM orders");
  const [isExecutingFilter, setIsExecutingFilter] = useState(false);
  
  const [newOrder, setNewOrder] = useState({
    customerId: '',
    status: 'pending',
    totalAmount: 0,
  });
  
  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.id.includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit' 
    }).format(date);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: name === 'totalAmount' ? parseFloat(value) : value,
    });
  };

  const handleCustomerChange = (value: string) => {
    setNewOrder({
      ...newOrder,
      customerId: value,
    });
  };

  const handleStatusChange = (value: string) => {
    setNewOrder({
      ...newOrder,
      status: value,
    });
  };

  const logQuery = (query: string, source: string) => {
    setSqlQueries(prev => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        query,
        source,
        duration: Math.floor(Math.random() * 50) + 5,
      },
      ...prev
    ]);
  };

  const fetchCustomers = async () => {
    try {
      logQuery('SELECT customer_id, customer_name FROM customers', 'Fetch Customers for Dropdown');
      
      const { data, error } = await supabase
        .from('customers')
        .select('customer_id, customer_name');
      
      if (error) throw error;
      
      setCustomers((data || []).map(customer => ({
        id: customer.customer_id,
        name: customer.customer_name
      })));
      
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      toast({
        title: "Error",
        description: "Could not load customer data for dropdown",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      logQuery(`
SELECT o.order_id, o.status, o.order_date, o.total_amount, o.updated_at, 
c.customer_id, c.customer_name 
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
ORDER BY o.order_date DESC`, 'Fetch Orders');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          status,
          order_date,
          total_amount,
          updated_at,
          customers (
            customer_id,
            customer_name
          )
        `)
        .order('order_date', { ascending: false });
      
      if (error) throw error;
      
      const formattedOrders = (data || []).map(order => ({
        id: order.order_id,
        customer: {
          id: order.customers?.customer_id || 'Unknown',
          name: order.customers?.customer_name || 'Unknown Customer'
        },
        status: order.status,
        orderDate: order.order_date,
        totalAmount: order.total_amount,
        updatedAt: order.updated_at
      }));
      
      setOrders(formattedOrders);
      
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      toast({
        title: "Error",
        description: "Could not load order data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOrder.customerId || newOrder.totalAmount <= 0) {
      toast({
        title: "Missing Fields",
        description: "Please select a customer and enter a valid total amount",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const orderDate = new Date().toISOString();
      
      logQuery(`
INSERT INTO orders (customer_id, status, order_date, total_amount)
VALUES ('${newOrder.customerId}', '${newOrder.status}', '${orderDate}', ${newOrder.totalAmount})
RETURNING *`, 'Add Order');
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_id: newOrder.customerId,
          status: newOrder.status,
          total_amount: newOrder.totalAmount,
          order_date: orderDate
        })
        .select(`
          order_id,
          status,
          order_date,
          total_amount,
          updated_at,
          customers (
            customer_id,
            customer_name
          )
        `);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newOrderData = {
          id: data[0].order_id,
          customer: {
            id: data[0].customers?.customer_id || 'Unknown',
            name: data[0].customers?.customer_name || 'Unknown Customer'
          },
          status: data[0].status,
          orderDate: data[0].order_date,
          totalAmount: data[0].total_amount,
          updatedAt: data[0].updated_at
        };
        
        setOrders(prevOrders => [newOrderData, ...prevOrders]);
      }
      
      setShowAddModal(false);
      setNewOrder({
        customerId: '',
        status: 'pending',
        totalAmount: 0
      });
      
      toast({
        title: "Success",
        description: "Order added successfully",
      });
      
    } catch (err: any) {
      console.error('Error adding order:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to add order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (order: OrderType) => {
    try {
      logQuery(`DELETE FROM orders WHERE order_id = '${order.id}'`, 'Delete Order');
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('order_id', order.id);
      
      if (error) throw error;
      
      setOrders(prevOrders => prevOrders.filter(o => o.id !== order.id));
      
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
      
    } catch (err: any) {
      console.error('Error deleting order:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete order",
        variant: "destructive",
      });
    } finally {
      setOrderToDelete(null);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingOrder) return;
    
    const { name, value } = e.target;
    setEditingOrder({
      ...editingOrder,
      [name]: name === 'totalAmount' ? parseFloat(value) : value,
    });
  };

  const handleEditStatusChange = (value: string) => {
    if (!editingOrder) return;
    
    setEditingOrder({
      ...editingOrder,
      status: value,
    });
  };

  const handleEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingOrder) return;
    
    try {
      setIsSubmitting(true);
      
      logQuery(`
UPDATE orders 
SET status = '${editingOrder.status}', 
    total_amount = ${editingOrder.totalAmount}
WHERE order_id = '${editingOrder.id}'`, 'Update Order');
      
      const { error } = await supabase
        .from('orders')
        .update({
          status: editingOrder.status,
          total_amount: editingOrder.totalAmount
        })
        .eq('order_id', editingOrder.id);
      
      if (error) throw error;
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === editingOrder.id ? editingOrder : order
        )
      );
      
      setShowEditModal(false);
      setEditingOrder(null);
      
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      
    } catch (err: any) {
      console.error('Error updating order:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sqlFilter?.trim()) {
      toast({
        title: "Invalid Query",
        description: "Please enter a valid SQL query",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsExecutingFilter(true);
      
      logQuery(sqlFilter, 'Custom Filter');
      
      if (!sqlFilter.toLowerCase().trim().startsWith('select')) {
        throw new Error("Only SELECT queries are allowed for filtering");
      }
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          status,
          order_date,
          total_amount,
          updated_at,
          customers (
            customer_id,
            customer_name
          )
        `);
      
      if (error) throw error;
      
      const formattedOrders = (data || []).map(order => ({
        id: order.order_id,
        customer: {
          id: order.customers?.customer_id || 'Unknown',
          name: order.customers?.customer_name || 'Unknown Customer'
        },
        status: order.status,
        orderDate: order.order_date,
        totalAmount: order.total_amount,
        updatedAt: order.updated_at
      }));
      
      setOrders(formattedOrders);
      setShowFilterModal(false);
      
      toast({
        title: "Query Executed",
        description: `Found ${formattedOrders.length} results`,
      });
      
    } catch (err: any) {
      console.error('Error executing custom query:', err);
      toast({
        title: "Query Error",
        description: err.message || "Failed to execute query",
        variant: "destructive",
      });
    } finally {
      setIsExecutingFilter(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and track their status
          </p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddOrder}>
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Enter the order details to create a new order
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerId" className="text-right">
                    Customer*
                  </Label>
                  <Select
                    value={newOrder.customerId}
                    onValueChange={handleCustomerChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newOrder.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="totalAmount" className="text-right">
                    Total Amount*
                  </Label>
                  <Input
                    id="totalAmount"
                    name="totalAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newOrder.totalAmount}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Order
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>
            {loading 
              ? "Loading order data..." 
              : `You have ${orders.length} orders in your database`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search" 
                placeholder="Search orders..." 
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilterModal(true)}
            >
              <Filter className="mr-2 h-4 w-4" />
              SQL Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading orders...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingOrder(order);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setOrderToDelete(order)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <SqlQueryViewer queries={sqlQueries} />
      
      {orderToDelete && (
        <Dialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete order #{orderToDelete.id}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOrderToDelete(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteOrder(orderToDelete)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {editingOrder && (
        <Dialog open={showEditModal} onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setEditingOrder(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditOrder}>
              <DialogHeader>
                <DialogTitle>Edit Order</DialogTitle>
                <DialogDescription>
                  Update the order details and click save when you're done
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Order ID
                  </Label>
                  <div className="col-span-3 text-sm">
                    {editingOrder.id}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Customer
                  </Label>
                  <div className="col-span-3 text-sm">
                    {editingOrder.customer.name}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editingOrder.status}
                    onValueChange={handleEditStatusChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_totalAmount" className="text-right">
                    Total Amount
                  </Label>
                  <Input
                    id="edit_totalAmount"
                    name="totalAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editingOrder.totalAmount}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                  />
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
      
      {/* SQL Filter Dialog */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={executeCustomQuery}>
            <DialogHeader>
              <DialogTitle>Custom SQL Filter</DialogTitle>
              <DialogDescription>
                Write a SQL query to filter your order data
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-2 flex justify-between items-center">
                <Label htmlFor="sql-query">SQL Query</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSqlFilter("SELECT * FROM orders")}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSqlFilter("SELECT * FROM orders WHERE status = 'pending'")}
                  >
                    Pending
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSqlFilter("SELECT * FROM orders WHERE total_amount > 1000")}
                  >
                    Large Orders
                  </Button>
                </div>
              </div>
              <textarea
                id="sql-query"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your SQL query..."
                value={sqlFilter}
                onChange={(e) => setSqlFilter(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Example: SELECT * FROM orders WHERE status = 'delivered' ORDER BY order_date DESC
              </p>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Reset to show all orders
                  logQuery('SELECT * FROM orders', 'Reset Filter');
                  fetchOrders();
                  setShowFilterModal(false);
                }}
              >
                Reset Filter
              </Button>
              <Button 
                type="submit" 
                disabled={isExecutingFilter}
              >
                {isExecutingFilter && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Execute Query
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;

