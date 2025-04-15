
import React, { useEffect } from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface OrderDetailsFormProps {
  products: Array<{
    sku: string;
    product_name: string;
    price: number;
  }>;
  form: any;
}

const OrderDetailsForm = ({ products, form }: OrderDetailsFormProps) => {
  const selectedProductSku = form.watch("product_sku");
  
  // When product changes, update the total amount
  useEffect(() => {
    if (selectedProductSku) {
      const selectedProduct = products.find(p => p.sku === selectedProductSku);
      const quantity = form.getValues("quantity") || 1;
      
      if (selectedProduct) {
        // Update the total amount based on selected product price and quantity
        form.setValue("total_amount", selectedProduct.price * quantity);
      }
    }
  }, [selectedProductSku, form, products]);

  // When quantity changes, update the total amount
  const handleQuantityChange = (value: number) => {
    const selectedProduct = products.find(p => p.sku === selectedProductSku);
    
    if (selectedProduct) {
      // Update the total amount based on selected product price and quantity
      form.setValue("total_amount", selectedProduct.price * value);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="product_sku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.sku} value={product.sku}>
                    {product.product_name} - ₹{product.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                min="1"
                onChange={e => {
                  const value = parseInt(e.target.value);
                  field.onChange(value);
                  handleQuantityChange(value);
                }}
              />
            </FormControl>
            <FormDescription>
              Order amount will be calculated automatically based on product price and quantity
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default OrderDetailsForm;
