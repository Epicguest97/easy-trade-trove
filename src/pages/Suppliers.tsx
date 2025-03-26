import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, RefreshCw, FileText, Truck, Package2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Database } from "@/integrations/supabase/types";

type SupplierStatus = Database['public']['Enums']['supplier_status'];

type Supplier = {
  supplier_id: string;
  supplier_name: string;
  contact: string;
  address: string;
  status: SupplierStatus;
  created_at: string;
  updated_at: string;
  productCount?: number;
  transactionCount?: number;
};

type SupplierProduct = {
  sku: string;
  supplier_id: string;
  created_at: string;
  product_name: string;
  price: number;
  category: string;
};

type StockTransaction = {
  transaction_id: string;
  transaction_type: string;
  quantity: number;
  date: string;
  sku: string;
  supplier_id: string;
  product_name: string;
};

const supplierFormSchema = z.object({
  supplier_name: z.string().min(1, "Supplier name is required"),
  contact: z.string().min(1, "Contact information is required"),
  address: z.string().min(1, "Address is required"),
  status: z.enum(['active', 'inactive', 'pending_review'] as const)
});

const Suppliers = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lastQuery, setLastQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("suppliers");

  const form = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      supplier_name: "",
      contact: "",
      address: "",
      status: "active" as SupplierStatus,
    },
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('suppliers')
        .select(`
          *,
          supplier_products:supplier_products(count),
          stock_transactions:stock_transactions(count)
        `);

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter as SupplierStatus);
      }

      if (searchQuery) {
        query = query.or(`supplier_name.ilike.%${searchQuery}%,contact.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      setLastQuery(query.url.toString());

      if (error) {
        throw error;
      }

      const formattedSuppliers = data.map(supplier => ({
        ...supplier,
        productCount: supplier.supplier_products?.length || 0,
        transactionCount: supplier.stock_transactions?.length || 0
      }));

      setSuppliers(formattedSuppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierProducts = async (supplierId: string) => {
    try {
      const { data, error } = await supabase
        .from('supplier_products')
        .select(`
          *,
          products(product_name, price, category)
        `)
        .eq('supplier_id', supplierId);

      if (error) throw error;

      const formattedProducts = data.map(item => ({
        sku: item.sku,
        supplier_id: item.supplier_id,
        created_at: item.created_at,
        product_name: item.products?.product_name || 'Unknown',
        price: item.products?.price || 0,
        category: item.products?.category || 'Unknown'
      }));

      setSupplierProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching supplier products:", error);
      toast({
        title: "Error",
        description: "Failed to load supplier products",
        variant: "destructive",
      });
    }
  };

  const fetchSupplierTransactions = async (supplierId: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          products(product_name)
        `)
        .eq('supplier_id', supplierId);

      if (error) throw error;

      const formattedTransactions = data.map(tx => ({
        transaction_id: tx.transaction_id,
        transaction_type: tx.transaction_type,
        quantity: tx.quantity,
        date: tx.date,
        sku: tx.sku || '',
        supplier_id: tx.supplier_id || '',
        product_name: tx.products?.product_name || 'Unknown'
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Error fetching supplier transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load supplier transactions",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    if (selectedSupplierId) {
      fetchSupplierProducts(selectedSupplierId);
      fetchSupplierTransactions(selectedSupplierId);
    }
  }, [selectedSupplierId]);

  const handleCreateSupplier = async (values: z.infer<typeof supplierFormSchema>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          supplier_name: values.supplier_name,
          contact: values.contact,
          address: values.address,
          status: values.status
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Supplier created successfully",
      });
      
      setOpenDialog(false);
      form.reset();
      fetchSuppliers();
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast({
        title: "Error",
        description: "Failed to create supplier",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSupplier = async (values: z.infer<typeof supplierFormSchema>) => {
    if (!editingSupplier) return;
    
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({
          supplier_name: values.supplier_name,
          contact: values.contact,
          address: values.address,
          status: values.status as SupplierStatus
        })
        .eq('supplier_id', editingSupplier.supplier_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
      
      setOpenDialog(false);
      setEditingSupplier(null);
      form.reset();
      fetchSuppliers();
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('supplier_id', supplierId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
      
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.reset({
      supplier_name: supplier.supplier_name,
      contact: supplier.contact,
      address: supplier.address,
      status: supplier.status
    });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingSupplier(null);
    form.reset();
  };

  const handleSelectSupplier = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setActiveTab("products");
  };

  const getStatusBadgeVariant = (status: SupplierStatus) => {
    switch(status) {
      case 'active': return "default";
      case 'inactive': return "destructive";
      case 'pending_review': return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSupplier(null);
              form.reset({
                supplier_name: "",
                contact: "",
                address: "",
                status: "active" as SupplierStatus,
              });
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Edit Supplier" : "Create New Supplier"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(editingSupplier ? handleUpdateSupplier : handleCreateSupplier)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="supplier_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending_review">Pending Review</SelectItem>
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
                    {editingSupplier ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="products" disabled={!selectedSupplierId}>Products</TabsTrigger>
          <TabsTrigger value="transactions" disabled={!selectedSupplierId}>Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suppliers">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Supplier Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchSuppliers}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">Loading suppliers...</TableCell>
                      </TableRow>
                    ) : suppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">No suppliers found</TableCell>
                      </TableRow>
                    ) : (
                      suppliers.map((supplier) => (
                        <TableRow key={supplier.supplier_id}>
                          <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                          <TableCell>{supplier.contact}</TableCell>
                          <TableCell>{supplier.address}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(supplier.status)}>
                              {supplier.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{supplier.productCount}</TableCell>
                          <TableCell>{supplier.transactionCount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleSelectSupplier(supplier.supplier_id)}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditSupplier(supplier)}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSupplier(supplier.supplier_id)}>
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
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Package2 className="mr-2 h-5 w-5" />
                Supplier Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Added On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">No products found for this supplier</TableCell>
                      </TableRow>
                    ) : (
                      supplierProducts.map((product) => (
                        <TableRow key={product.sku}>
                          <TableCell className="font-medium">{product.sku}</TableCell>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Supplier Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">No transactions found for this supplier</TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => (
                        <TableRow key={tx.transaction_id}>
                          <TableCell className="font-medium">{tx.transaction_id.substring(0, 8)}</TableCell>
                          <TableCell>{tx.product_name}</TableCell>
                          <TableCell>
                            <Badge variant={tx.transaction_type === 'purchase' ? 'default' : 'secondary'}>
                              {tx.transaction_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{tx.quantity}</TableCell>
                          <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            SQL Query
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SqlQueryViewer query={lastQuery} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Suppliers;
