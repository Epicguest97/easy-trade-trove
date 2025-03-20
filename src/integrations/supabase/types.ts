export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_product_management: {
        Row: {
          admin_id: string
          created_at: string
          sku: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          sku: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_product_management_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["admin_id"]
          },
          {
            foreignKeyName: "admin_product_management_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      admins: {
        Row: {
          admin_id: string
          contact: string
          created_at: string
          email: string
          name: string
          password: string
          role: string
          updated_at: string
        }
        Insert: {
          admin_id?: string
          contact: string
          created_at?: string
          email: string
          name: string
          password: string
          role: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          contact?: string
          created_at?: string
          email?: string
          name?: string
          password?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      carts: {
        Row: {
          cart_id: string
          customer_id: string | null
          date_added: string
          quantity: number
          sku: string | null
        }
        Insert: {
          cart_id?: string
          customer_id?: string | null
          date_added?: string
          quantity: number
          sku?: string | null
        }
        Update: {
          cart_id?: string
          customer_id?: string | null
          date_added?: string
          quantity?: number
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "carts_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      customers: {
        Row: {
          contact: string
          created_at: string
          customer_id: string
          customer_name: string
          last_order: string | null
          status: Database["public"]["Enums"]["customer_status"]
          total_spent: number | null
          type: Database["public"]["Enums"]["customer_type"]
          updated_at: string
        }
        Insert: {
          contact: string
          created_at?: string
          customer_id?: string
          customer_name: string
          last_order?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          total_spent?: number | null
          type?: Database["public"]["Enums"]["customer_type"]
          updated_at?: string
        }
        Update: {
          contact?: string
          created_at?: string
          customer_id?: string
          customer_name?: string
          last_order?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          total_spent?: number | null
          type?: Database["public"]["Enums"]["customer_type"]
          updated_at?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          applicable_categories: string[] | null
          code: string
          coupon_id: string
          created_at: string
          discount_percentage: number
          expiry_date: string
          updated_at: string
        }
        Insert: {
          applicable_categories?: string[] | null
          code: string
          coupon_id?: string
          created_at?: string
          discount_percentage: number
          expiry_date: string
          updated_at?: string
        }
        Update: {
          applicable_categories?: string[] | null
          code?: string
          coupon_id?: string
          created_at?: string
          discount_percentage?: number
          expiry_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_details: {
        Row: {
          created_at: string
          order_detail_id: string
          order_id: string | null
          price_at_purchase: number
          quantity: number
          sku: string | null
        }
        Insert: {
          created_at?: string
          order_detail_id?: string
          order_id?: string | null
          price_at_purchase: number
          quantity: number
          sku?: string | null
        }
        Update: {
          created_at?: string
          order_detail_id?: string
          order_id?: string | null
          price_at_purchase?: number
          quantity?: number
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_details_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      orders: {
        Row: {
          admin_id: string | null
          created_at: string
          customer_id: string | null
          order_date: string
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          customer_id?: string | null
          order_date?: string
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          customer_id?: string | null
          order_date?: string
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["admin_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          order_id: string | null
          payment_id: string
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          transaction_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          order_id?: string | null
          payment_id?: string
          payment_method: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transaction_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          order_id?: string | null
          payment_id?: string
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          price: number
          product_name: string
          sku: string
          status: Database["public"]["Enums"]["product_status"]
          stock: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          price: number
          product_name: string
          sku: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          price?: number
          product_name?: string
          sku?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          customer_id: string | null
          rating: number
          review_date: string
          review_id: string
          review_text: string | null
          sku: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          rating: number
          review_date?: string
          review_id?: string
          review_text?: string | null
          sku?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          rating?: number
          review_date?: string
          review_id?: string
          review_text?: string | null
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "reviews_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      shipping: {
        Row: {
          courier_service: string
          created_at: string
          estimated_delivery_date: string | null
          order_id: string | null
          shipping_address: string
          shipping_id: string
          status: Database["public"]["Enums"]["shipping_status"]
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          courier_service: string
          created_at?: string
          estimated_delivery_date?: string | null
          order_id?: string | null
          shipping_address: string
          shipping_id?: string
          status?: Database["public"]["Enums"]["shipping_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          courier_service?: string
          created_at?: string
          estimated_delivery_date?: string | null
          order_id?: string | null
          shipping_address?: string
          shipping_id?: string
          status?: Database["public"]["Enums"]["shipping_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      stock_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          quantity: number
          sku: string | null
          supplier_id: string | null
          transaction_id: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date?: string
          quantity: number
          sku?: string | null
          supplier_id?: string | null
          transaction_id?: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          quantity?: number
          sku?: string | null
          supplier_id?: string | null
          transaction_id?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["admin_id"]
          },
          {
            foreignKeyName: "stock_transactions_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "stock_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          created_at: string
          sku: string
          supplier_id: string
        }
        Insert: {
          created_at?: string
          sku: string
          supplier_id: string
        }
        Update: {
          created_at?: string
          sku?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string
          contact: string
          created_at: string
          status: Database["public"]["Enums"]["supplier_status"]
          supplier_id: string
          supplier_name: string
          updated_at: string
        }
        Insert: {
          address: string
          contact: string
          created_at?: string
          status?: Database["public"]["Enums"]["supplier_status"]
          supplier_id?: string
          supplier_name: string
          updated_at?: string
        }
        Update: {
          address?: string
          contact?: string
          created_at?: string
          status?: Database["public"]["Enums"]["supplier_status"]
          supplier_id?: string
          supplier_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      customer_status: "active" | "inactive" | "blocked"
      customer_type: "retail" | "wholesale" | "corporate"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      product_status: "active" | "discontinued" | "out_of_stock" | "low_stock"
      shipping_status:
        | "processing"
        | "shipped"
        | "delivered"
        | "delayed"
        | "cancelled"
      supplier_status: "active" | "inactive" | "pending_review"
      transaction_type:
        | "purchase"
        | "sale"
        | "adjustment"
        | "return"
        | "transfer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
