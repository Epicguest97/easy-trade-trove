
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SqlQueryViewer from "@/components/SqlQueryViewer";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

const Suppliers = () => {
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM suppliers');

  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*");

      if (error) throw error;
      
      // Use static SQL string instead of non-existent toSql method
      setSqlQuery('SELECT * FROM suppliers');
      
      return data;
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers Management</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          <span>Add Supplier</span>
        </Button>
      </div>
      
      {isLoading ? (
        <div>Loading suppliers...</div>
      ) : error ? (
        <div>Error loading suppliers: {error.message}</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplier ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {suppliers?.map((supplier) => (
                  <tr key={supplier.supplier_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{supplier.supplier_id?.slice(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{supplier.supplier_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{supplier.contact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{supplier.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${supplier.status === 'active' ? 'bg-green-100 text-green-800' : 
                          supplier.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {supplier.status}
                      </span>
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

export default Suppliers;
