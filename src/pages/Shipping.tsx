
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SqlQueryViewer from "@/components/SqlQueryViewer";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

const Shipping = () => {
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM shipping');

  const { data: shipments, isLoading, error } = useQuery({
    queryKey: ["shipping"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping")
        .select("*, orders(order_id)");

      if (error) throw error;
      
      // Use static SQL string instead of non-existent toSql method
      setSqlQuery('SELECT shipping.*, orders.order_id FROM shipping LEFT JOIN orders ON shipping.order_id = orders.order_id');
      
      return data;
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shipping Management</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          <span>Add Shipment</span>
        </Button>
      </div>
      
      {isLoading ? (
        <div>Loading shipments...</div>
      ) : error ? (
        <div>Error loading shipments: {error.message}</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tracking #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Courier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Est. Delivery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {shipments?.map((shipment) => (
                  <tr key={shipment.shipping_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{shipment.tracking_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {shipment.order_id ? shipment.order_id.slice(0, 8) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{shipment.courier_service}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {shipment.shipping_address.length > 20 
                        ? `${shipment.shipping_address.substring(0, 20)}...` 
                        : shipment.shipping_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${shipment.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          shipment.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                          shipment.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {shipment.estimated_delivery_date 
                        ? new Date(shipment.estimated_delivery_date).toLocaleDateString() 
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default Shipping;
