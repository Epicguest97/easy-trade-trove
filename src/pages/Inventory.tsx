import { useState, useEffect } from "react";
import { 
  Package2, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Filter, 
  ArrowUpDown,
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
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/inventory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SqlQueryViewer from "@/components/SqlQueryViewer";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryItems, setInventoryItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    product_name: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sqlQueries, setSqlQueries] = useState<Array<{
    id: string;
    timestamp: Date;
    query: string;
    duration?: number;
    source?: string;
  }>>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sqlFilter, setSqlFilter] = useState<string>("SELECT * FROM products");
  const [isExecutingFilter, setIsExecutingFilter] = useState(false);
  
  // Extract fetchProducts from useEffect to make it reusable
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log the query we're about to execute
      logQuery('SELECT * FROM products', 'Fetch Products');
      
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setInventoryItems(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      toast({
        title: "Error",
        description: "Could not load inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Filter inventory items based on search term
  const filteredItems = inventoryItems.filter(item => 
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      case "discontinued":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormattedStatus = (status: string) => {
    switch(status) {
      case "active":
        return "In Stock";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      case "discontinued":
        return "Discontinued";
      default:
        return status;
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.product_name || !newProduct.sku || !newProduct.category) {
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
      logQuery(`INSERT INTO products (product_name, sku, category, price, stock, status)
VALUES ('${newProduct.product_name}', '${newProduct.sku}', '${newProduct.category}', ${newProduct.price}, ${newProduct.stock}, '${newProduct.status}')
RETURNING *`, 'Add Product');
      
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct as Product])
        .select();
      
      if (error) throw error;
      
      setInventoryItems([...(data || []), ...inventoryItems]);
      setShowAddModal(false);
      setNewProduct({
        product_name: '',
        sku: '',
        category: '',
        price: 0,
        stock: 0,
        status: 'active'
      });
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      
    } catch (err: any) {
      console.error('Error adding product:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    });
  };

  const handleStatusChange = (value: string) => {
    setNewProduct({
      ...newProduct,
      status: value as "active" | "low_stock" | "out_of_stock" | "discontinued",
    });
  };

  const logQuery = (query: string, source: string) => {
    setSqlQueries(prev => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        query,
        source,
        duration: Math.floor(Math.random() * 50) + 5, // Mock duration - replace with actual timing
      },
      ...prev
    ]);
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      // Log the query
      logQuery(`DELETE FROM products WHERE sku = '${product.sku}'`, 'Delete Product');
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('sku', product.sku);  // Assuming SKU is unique
      
      if (error) throw error;
      
      // Update the local state to remove the deleted product
      setInventoryItems(prevItems => prevItems.filter(item => item.sku !== product.sku));
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
    } catch (err: any) {
      console.error('Error deleting product:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      // Reset the productToDelete state
      setProductToDelete(null);
    }
  };

  // Add this new function near your other handler functions
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;
    
    if (!editingProduct.product_name || !editingProduct.sku || !editingProduct.category) {
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
      logQuery(`UPDATE products
  SET product_name = '${editingProduct.product_name}',
      category = '${editingProduct.category}',
      price = ${editingProduct.price},
      stock = ${editingProduct.stock},
      status = '${editingProduct.status}'
  WHERE sku = '${editingProduct.sku}'`, 'Update Product');
      
      const { error } = await supabase
        .from('products')
        .update({
          product_name: editingProduct.product_name,
          category: editingProduct.category,
          price: editingProduct.price,
          stock: editingProduct.stock,
          status: editingProduct.status,
        })
        .eq('sku', editingProduct.sku);
      
      if (error) throw error;
      
      // Update local state
      setInventoryItems(prevItems => 
        prevItems.map(item => 
          item.sku === editingProduct.sku ? editingProduct : item
        )
      );
      
      setShowEditModal(false);
      setEditingProduct(null);
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      
    } catch (err: any) {
      console.error('Error updating product:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this helper function to handle edit input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!editingProduct) return;
    
    setEditingProduct({
      ...editingProduct,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    });
  };

  // Add this helper function to handle edit status changes
  const handleEditStatusChange = (value: string) => {
    if (!editingProduct) return;
    
    setEditingProduct({
      ...editingProduct,
      status: value as "active" | "low_stock" | "out_of_stock" | "discontinued",
    });
  };

  // Add this function after your other handler functions
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
      
      const { data, error } = await supabase.rpc('execute_sql', {
        query_text: sqlFilter
      });
      
      if (error) throw error;
      
      // Update the inventory items with the filtered results
      setInventoryItems(data || []);
      setShowFilterModal(false);
      
      toast({
        title: "Query Executed",
        description: `Found ${(data ?? []).length} results`,
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and stock levels
          </p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddProduct}>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new product to your inventory
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product_name" className="text-right">
                    Name*
                  </Label>
                  <Input
                    id="product_name"
                    name="product_name"
                    value={newProduct.product_name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">
                    SKU*
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={newProduct.sku}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category*
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={newProduct.category}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newProduct.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
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
                  Add Product
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
          <CardDescription>You have {inventoryItems.length} products in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search" 
                placeholder="Search products..." 
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
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead className="max-w-[300px]">Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
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
                        Loading inventory...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell className="font-medium">{item.sku}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{item.product_name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.stock}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {getFormattedStatus(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingProduct(item);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setProductToDelete(item)}
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
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <SqlQueryViewer queries={sqlQueries} />

      {productToDelete && (
        <Dialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{productToDelete.product_name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProductToDelete(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteProduct(productToDelete)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editingProduct && (
        <Dialog open={showEditModal} onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setEditingProduct(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleEditProduct}>
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Update the product details and click save when you're done
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_product_name" className="text-right">
                    Name*
                  </Label>
                  <Input
                    id="edit_product_name"
                    name="product_name"
                    value={editingProduct.product_name}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_sku" className="text-right">
                    SKU*
                  </Label>
                  <Input
                    id="edit_sku"
                    name="sku"
                    value={editingProduct.sku}
                    className="col-span-3"
                    disabled
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_category" className="text-right">
                    Category*
                  </Label>
                  <Input
                    id="edit_category"
                    name="category"
                    value={editingProduct.category}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="edit_price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="edit_stock"
                    name="stock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={handleEditInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editingProduct.status}
                    onValueChange={handleEditStatusChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
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
                Write a SQL query to filter your inventory data
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
                    onClick={() => setSqlFilter("SELECT * FROM products")}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSqlFilter("SELECT * FROM products WHERE category = 'Electronics'")}
                  >
                    Electronics
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSqlFilter("SELECT * FROM products WHERE stock < 10")}
                  >
                    Low Stock
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
                Example: SELECT * FROM products WHERE category = 'Electronics' ORDER BY price DESC
              </p>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Reset to show all products
                  logQuery('SELECT * FROM products', 'Reset Filter');
                  fetchProducts();
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

export default Inventory;
