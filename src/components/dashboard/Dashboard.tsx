import { useState, useEffect } from 'react';
import { Package2, TrendingUp, Users, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import StatsCard from './StatsCard';
import { toast } from '@/components/ui/use-toast';
import SqlQueryViewer from '@/components/SqlQueryViewer'; // Import the component

const Dashboard = () => {
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [activeCustomers, setActiveCustomers] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  // Add state for SQL queries
  const [sqlQueries, setSqlQueries] = useState<Array<{
    id: string;
    timestamp: Date;
    query: string;
    duration?: number;
    source?: string;
  }>>([]);

  // Add these state variables after your other state declarations
  const [lowStockItems, setLowStockItems] = useState<number | null>(null);
  const [lowStockLoading, setLowStockLoading] = useState(true);

  // Add function to log queries
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

  // Fetch data from database
  useEffect(() => {
    const fetchTotalProducts = async () => {
      try {
        setIsLoading(true);
        
        // Log the query
        logQuery('SELECT COUNT(*) FROM products', 'Total Products');
        
        // Query to count all products
        const { data, error, count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        setTotalProducts(count || 0);
      } catch (err) {
        console.error('Error fetching product count:', err);
        toast({
          title: "Error",
          description: "Failed to fetch product count",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTotalSales = async () => {
      try {
        setSalesLoading(true);
        
        // Log the query
        logQuery('SELECT SUM(price_at_purchase * quantity) FROM order_details', 'Total Sales');
        
        // Query to get all order details
        const { data, error } = await supabase
          .from('order_details')
          .select('price_at_purchase, quantity');
        
        if (error) throw error;
        
        // Calculate total sales by multiplying price by quantity for each order line
        const totalAmount = (data || []).reduce((sum, item) => {
          return sum + (item.price_at_purchase * item.quantity);
        }, 0);
        
        setTotalSales(totalAmount);
      } catch (err) {
        console.error('Error calculating total sales:', err);
        toast({
          title: "Error",
          description: "Failed to calculate total sales",
          variant: "destructive",
        });
      } finally {
        setSalesLoading(false);
      }
    };
    
    // New function to fetch active customers count
    const fetchActiveCustomers = async () => {
      try {
        setCustomersLoading(true);
        
        // Log the query
        logQuery('SELECT COUNT(*) FROM customers WHERE status = \'active\'', 'Active Customers');
        
        // Query to count active customers
        const { data, error, count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        
        if (error) throw error;
        
        setActiveCustomers(count || 0);
      } catch (err) {
        console.error('Error fetching active customers:', err);
        toast({
          title: "Error", 
          description: "Failed to fetch active customers count",
          variant: "destructive",
        });
      } finally {
        setCustomersLoading(false);
      }
    };

    // Add this function inside your useEffect, after fetchActiveCustomers
    const fetchLowStockItems = async () => {
      try {
        setLowStockLoading(true);
        
        // Log the query
        logQuery('SELECT COUNT(*) FROM products WHERE stock < 10', 'Low Stock Items');
        
        // Query to count products with low stock
        const { data, error, count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .lt('stock', 10); // Items with stock less than 10
        
        if (error) throw error;
        
        setLowStockItems(count || 0);
      } catch (err) {
        console.error('Error fetching low stock items:', err);
        toast({
          title: "Error", 
          description: "Failed to fetch low stock items count",
          variant: "destructive",
        });
      } finally {
        setLowStockLoading(false);
      }
    };

    fetchTotalProducts();
    fetchTotalSales();
    fetchActiveCustomers();
    fetchLowStockItems();
  }, []);

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to your inventory dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        {isLoading ? (
          <StatsCard
            title="Total Products"
            value="Loading..."
            icon={<Package2 className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
          />
        ) : (
          <StatsCard
            title="Total Products"
            value={totalProducts?.toLocaleString() || "0"}
            icon={<Package2 className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
          />
        )}
        
        {salesLoading ? (
          <StatsCard
            title="Total Sales"
            value="Loading..."
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
          />
        ) : (
          <StatsCard
            title="Total Sales"
            value={formatCurrency(totalSales)}
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
          />
        )}
        
        {customersLoading ? (
          <StatsCard
            title="Active Customers"
            value="Loading..."
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 5, isPositive: true }}
          />
        ) : (
          <StatsCard
            title="Active Customers"
            value={activeCustomers?.toLocaleString() || "0"}
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 5, isPositive: true }}
          />
        )}
        
        {lowStockLoading ? (
          <StatsCard
            title="Low Stock Items"
            value="Loading..."
            icon={<AlertCircle className="h-6 w-6" />}
            trend={{ value: 2, isPositive: false }}
          />
        ) : (
          <StatsCard
            title="Low Stock Items"
            value={lowStockItems?.toLocaleString() || "0"}
            icon={<AlertCircle className="h-6 w-6" />}
            trend={{ value: 2, isPositive: false }}
          />
        )}
      </div>
      
      {/* Add SQL Query Viewer at the bottom */}
      <SqlQueryViewer queries={sqlQueries} />
    </div>
  );
};

export default Dashboard;
