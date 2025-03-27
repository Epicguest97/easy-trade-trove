
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SqlQueryViewer from "@/components/SqlQueryViewer";
import { useQuery } from "@tanstack/react-query";

// Fix for the url property error on line 126
// Change from:
// setSqlQuery(query.url.toString());
// To:
const Suppliers = () => {
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM suppliers');

  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*");

      if (error) throw error;
      
      // Update SQL query for the viewer
      const query = supabase
        .from("suppliers")
        .select("*");
      
      setSqlQuery(query.toSql ? query.toSql() : 'SELECT * FROM suppliers');
      
      return data;
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Suppliers Management</h1>
      
      {isLoading ? (
        <div>Loading suppliers...</div>
      ) : error ? (
        <div>Error loading suppliers: {error.message}</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliers?.map((supplier) => (
                  <tr key={supplier.supplier_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.supplier_id?.slice(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.supplier_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.contact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${supplier.status === 'active' ? 'bg-green-100 text-green-800' : 
                          supplier.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {supplier.status}
                      </span>
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

export default Suppliers;
