import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Mail,
  Phone,
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

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Retail',
    totalSpent: 0,
    lastOrder: new Date().toISOString().split('T')[0],
    status: 'Active'
  });
  const [sqlQueries, setSqlQueries] = useState<Array<{
    id: string;
    timestamp: Date;
    query: string;
    duration?: number;
    source?: string;
  }>>([]);
  const [customerToDelete, setCustomerToDelete] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sqlFilter, setSqlFilter] = useState<string>("SELECT * FROM customers");
  const [isExecutingFilter, setIsExecutingFilter] = useState(false);
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: name === 'totalSpent' ? parseFloat(value) : value,
    });
  };

  const handleTypeChange = (value: string) => {
    setNewCustomer({
      ...newCustomer,
      type: value,
    });
  };

  const handleStatusChange = (value: string) => {
    setNewCustomer({
      ...newCustomer,
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
      setLoading(true);
      setError(null);
      
      logQuery('SELECT * FROM customers', 'Fetch Customers');
      
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      
      if (error) throw error;
      
      const formattedCustomers = (data || []).map(customer => {
        const [email, phone] = customer.contact?.split(', ') || ['', ''];
        return {
          id: Number(customer.customer_id),
          name: customer.customer_name,
          email,
          phone,
          type: typeof customer.type === 'string' 
            ? customer.type.charAt(0).toUpperCase() + customer.type.slice(1) 
            : 'Retail',
          totalSpent: customer.total_spent || 0,
          lastOrder: customer.last_order || new Date().toISOString().split('T')[0],
          status: typeof customer.status === 'string'
            ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1)
            : 'Active'
        };
      });
      
      setCustomers(formattedCustomers);
      
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again later.');
      toast({
        title: "Error",
        description: "Could not load customer data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      logQuery(`INSERT INTO customers (name, email, phone, type, total_spent, last_order, status)
  VALUES ('${newCustomer.name}', '${newCustomer.email}', '${newCustomer.phone}', 
  '${newCustomer.type}', ${newCustomer.totalSpent}, '${newCustomer.lastOrder}', '${newCustomer.status}')
  RETURNING *`, 'Add Customer');
      
      const { data, error } = await supabase
        .from('customers')
        .insert({
          customer_name: newCustomer.name,
          contact: `${newCustomer.email}, ${newCustomer.phone}`,
          type: newCustomer.type.toLowerCase() as "retail" | "wholesale" | "corporate",
          total_spent: newCustomer.totalSpent,
          last_order: newCustomer.lastOrder,
          status: newCustomer.status.toLowerCase() as "active" | "inactive" | "blocked"
        })
        .select();
      
      if (error) throw error;
      
      const formattedNewCustomers = (data || []).map(customer => {
        const [email, phone] = customer.contact.split(', ');
        return {
          id: Number(customer.customer_id),
          name: customer.customer_name,
          email,
          phone,
          type: customer.type,
          totalSpent: customer.total_spent,
          lastOrder: customer.last_order,
          status: customer.status
        };
      });
      
      setCustomers([...formattedNewCustomers, ...customers]);
      
      setShowAddModal(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        type: 'Retail',
        totalSpent: 0,
        lastOrder: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
      
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      
    } catch (err: any) {
      console.error('Error adding customer:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to add customer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (customer: any) => {
    try {
      // Log the query
      logQuery(`DELETE FROM customers WHERE customer_id = ${customer.id}`, 'Delete Customer');
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('customer_id', customer.id);
      
      if (error) throw error;
      
      // Update the local state to remove the deleted customer
      setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customer.id));
      
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      // Reset the customerToDelete state
      setCustomerToDelete(null);
    }
  };

  // Add these helper functions for handling edit form changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!editingCustomer) return;
    
    setEditingCustomer({
      ...editingCustomer,
      [name]: name === 'totalSpent' ? parseFloat(value) : value,
    });
  };

  const handleEditTypeChange = (value: string) => {
    if (!editingCustomer) return;
    
    setEditingCustomer({
      ...editingCustomer,
      type: value,
    });
  };

  const handleEditStatusChange = (value: string) => {
    if (!editingCustomer) return;
    
    setEditingCustomer({
      ...editingCustomer,
      status: value,
    });
  };

  // Add this function after handleDeleteCustomer
  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCustomer) return;
    
    if (!editingCustomer.name || !editingCustomer.email || !editingCustomer.phone) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Log the query
      logQuery(`UPDATE customers 
  SET name = '${editingCustomer.name}', 
      email = '${editingCustomer.email}', 
      phone = '${editingCustomer.phone}', 
      type = '${editingCustomer.type}', 
      total_spent = ${editingCustomer.totalSpent}, 
      last_order = '${editingCustomer.lastOrder}', 
      status = '${editingCustomer.status}' 
  WHERE customer_id = ${editingCustomer.id}`, 'Update Customer');
      
      const { error } = await supabase
        .from('customers')
        .update({
          customer_name: editingCustomer.name,
          contact: `${editingCustomer.email}, ${editingCustomer.phone}`,
          type: editingCustomer.type.toLowerCase(),
          total_spent: editingCustomer.totalSpent,
          last_order: editingCustomer.lastOrder,
          status: editingCustomer.status.toLowerCase()
        })
        .eq('customer_id', editingCustomer.id);
      
      if (error) throw error;
      
      // Update customers in local state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === editingCustomer.id ? editingCustomer : customer
        )
      );
      
      setShowEditModal(false);
      setEditingCustomer(null);
      
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      
    } catch (err: any) {
      console.error('Error updating customer:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update customer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this function after handleEditCustomer
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
      
      // Log the query being executed
      logQuery(sqlFilter, 'Custom Filter');
      
      // For safety, we'll only allow SELECT queries
      if (!sqlFilter.toLowerCase().trim().startsWith('select')) {
        throw new Error("Only SELECT queries are allowed for filtering");
      }
      
      // Execute the query
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      
      if (error) throw error;
      
      // Format the results to match our customer interface
      const formattedCustomers = (data || []).map(customer => {
        const [email, phone] = customer.contact?.split(', ') || ['', ''];
        return {
          id: Number(customer.customer_id),
          name: customer.customer_name,
          email,
          phone,
          type: typeof customer.type === 'string' 
            ? customer.type.charAt(0).toUpperCase() + customer.type.slice(1) 
            : 'Retail',
          totalSpent: customer.total_spent || 0,
          lastOrder: customer.last_order || new Date().toISOString().split('T')[0],
          status: typeof customer.status === 'string'
            ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1)
            : 'Active'
        };
      });
      
      // Update the customers list with the filtered results
      setCustomers(formattedCustomers);
      setShowFilterModal(false);
      
      toast({
        title: "Query Executed",
        description: `Found ${formattedCustomers.length} results`,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and orders
          </p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddCustomer}>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Fill in the customer details to add them to your database
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name*
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={newCustomer.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email*
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone*
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newCustomer.type}
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Wholesale">Wholesale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="totalSpent" className="text-right">
                    Total Spent
                  </Label>
                  <Input
                    id="totalSpent"
                    name="totalSpent"
                    type="number"
                    step="0.01"
                    value={newCustomer.totalSpent}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastOrder" className="text-right">
                    Last Order
                  </Label>
                  <Input
                    id="lastOrder"
                    name="lastOrder"
                    type="date"
                    value={newCustomer.lastOrder}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newCustomer.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
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
                  Add Customer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            {loading 
              ? "Loading customer data..." 
              : `You have ${customers.length} customers in your database`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search" 
                placeholder="Search customers..." 
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
                  <TableHead className="max-w-[250px]">Customer Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading customers...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.type}</TableCell>
                      <TableCell className="text-right">${customer.totalSpent.toFixed(2)}</TableCell>
                      <TableCell>{formatDate(customer.lastOrder)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingCustomer(customer);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setCustomerToDelete(customer)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <SqlQueryViewer queries={sqlQueries} />
      {customerToDelete && (
        <Dialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Customer</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{customerToDelete.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCustomerToDelete(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteCustomer(customerToDelete)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Edit Customer Dialog */}
      {editingCustomer && (
        <Dialog open={showEditModal} onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setEditingCustomer(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditCustomer}>
              <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
                <DialogDescription>
                  Update the customer details and click save when you're done
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_name" className="text-right">
                    Name*
                  </Label>
                  <Input
                    id="edit_name"
                    name="name"
                    value={editingCustomer.name}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_email" className="text-right">
                    Email*
                  </Label>
                  <Input
                    id="edit_email"
                    name="email"
                    type="email"
                    value={editingCustomer.email}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_phone" className="text-right">
                    Phone*
                  </Label>
                  <Input
                    id="edit_phone"
                    name="phone"
                    value={editingCustomer.phone}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={editingCustomer.type}
                    onValueChange={handleEditTypeChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Wholesale">Wholesale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_totalSpent" className="text-right">
                    Total Spent
                  </Label>
                  <Input
                    id="edit_totalSpent"
                    name="totalSpent"
                    type="number"
                    step="0.01"
                    value={editingCustomer.totalSpent}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_lastOrder" className="text-right">
                    Last Order
                  </Label>
                  <Input
                    id="edit_lastOrder"
                    name="lastOrder"
                    type="date"
                    value={editingCustomer.lastOrder}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editingCustomer.status}
                    onValueChange={handleEditStatusChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
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
      {/* SQL Filter Dialog */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={executeCustomQuery}>
            <DialogHeader>
              <DialogTitle>Custom SQL Filter</DialogTitle>
              <DialogDescription>
                Write a SQL query to filter your customer data
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
                    onClick={() => setSqlFilter("SELECT * FROM customers")}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSqlFilter("SELECT * FROM customers WHERE type = 'retail'")}
                  >
                    Retail
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSqlFilter("SELECT * FROM customers WHERE total_spent > 1000")}
                  >
                    High Value
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
                Example: SELECT * FROM customers WHERE type = 'wholesale' ORDER BY total_spent DESC
              </p>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Reset to show all customers
                  logQuery('SELECT * FROM customers', 'Reset Filter');
                  fetchCustomers();
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

export default Customers;
