
// Custom types for inventory management
export interface Product {
  sku: string;
  product_name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'discontinued' | 'out_of_stock' | 'low_stock';
  created_at: string;
  updated_at: string;
}

export type ProductStatus = 'active' | 'discontinued' | 'out_of_stock' | 'low_stock';
