
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

const Orders = () => {
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM orders');

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, customers(customer_id, customer_name, contact)");

      if (error) throw error;
      
      // Using a static SQL query string instead of the non-existent toSql method
      setSqlQuery('SELECT orders.*, customers.customer_name, customers.contact FROM orders LEFT JOIN customers ON orders.customer_id = customers.customer_id');
      
      // Query payments separately to get payment method for each order
      const orderIds = data.map(order => order.order_id);
      if (orderIds.length > 0) {
        const { data: paymentsData } = await supabase
          .from("payments")
          .select("order_id, payment_method")
          .in("order_id", orderIds);
          
        // Add payment_method to each order
        if (paymentsData) {
          const paymentsMap = paymentsData.reduce((acc, payment) => {
            acc[payment.order_id] = payment.payment_method;
            return acc;
          }, {});
          
          return data.map(order => ({
            ...order,
            payment_method: paymentsMap[order.order_id] || "N/A"
          }));
        }
      }
      
      return data.map(order => ({
        ...order,
        payment_method: "N/A"
      }));
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
      
      {isLoading ? (
        <div>Loading orders...</div>
      ) : error ? (
        <div>Error loading orders: {error.message}</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell className="font-medium">{order.order_id.slice(0, 8)}</TableCell>
                    <TableCell>
                      {order.customers ? order.customers.customer_name : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {new Date(order.order_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      ${order.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>{order.payment_method}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">SQL Query</h2>
            <SqlQueryViewer query={sqlQuery} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
