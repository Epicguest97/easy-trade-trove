
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SqlQueryViewer from "@/components/SqlQueryViewer";
import { useQuery } from "@tanstack/react-query";

const Shipping = () => {
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM shipping');

  const { data: shipments, isLoading, error } = useQuery({
    queryKey: ["shipping"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping")
        .select("*, orders(order_id)");

      if (error) throw error;
      
      // Instead of using the non-existent toSql method, just update with a static query string
      setSqlQuery('SELECT shipping.*, orders.order_id FROM shipping LEFT JOIN orders ON shipping.order_id = orders.order_id');
      
      return data;
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Shipping Management</h1>
      
      {isLoading ? (
        <div>Loading shipments...</div>
      ) : error ? (
        <div>Error loading shipments: {error.message}</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Delivery</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments?.map((shipment) => (
                  <tr key={shipment.shipping_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.tracking_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipment.order_id ? shipment.order_id.slice(0, 8) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.courier_service}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipment.estimated_delivery_date 
                        ? new Date(shipment.estimated_delivery_date).toLocaleDateString() 
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">SQL Query</h2>
            <SqlQueryViewer query={sqlQuery} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipping;
