
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

interface Product {
  sku: string;
  product_name: string;
  price: number;
  stock: number;
}

interface ProductSelectionProps {
  products: Product[];
  isLoading: boolean;
  form: any;
}

const ProductSelection = ({ products, isLoading, form }: ProductSelectionProps) => {
  const selectedProductSku = form.watch("product_sku");
  const quantity = form.watch("quantity");

  useEffect(() => {
    if (selectedProductSku && quantity) {
      const selectedProduct = products.find(p => p.sku === selectedProductSku);
      if (selectedProduct) {
        const maxStock = selectedProduct.stock;
        if (quantity > maxStock) {
          form.setValue("quantity", maxStock);
        }
      }
    }
  }, [selectedProductSku, quantity, products, form]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="product_sku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem 
                    key={product.sku} 
                    value={product.sku}
                    disabled={product.stock === 0}
                  >
                    {product.product_name} - ₹{product.price} 
                    (Stock: {product.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Only products with available stock are shown
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="quantity"
        render={({ field }) => {
          const selectedProduct = products.find(p => p.sku === selectedProductSku);
          const maxStock = selectedProduct?.stock || 1;

          return (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  min={1}
                  max={maxStock}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > maxStock) {
                      field.onChange(maxStock);
                    } else {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Maximum quantity: {maxStock}
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};

export default ProductSelection;
