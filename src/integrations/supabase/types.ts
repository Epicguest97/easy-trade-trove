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
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
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
      customer_orders: {
        Row: {
          created_at: string
          customer_address: string
          customer_email: string
          customer_name: string
          id: string
          order_id: string | null
          shipping_required: boolean
        }
        Insert: {
          created_at?: string
          customer_address: string
          customer_email: string
          customer_name: string
          id?: string
          order_id?: string | null
          shipping_required?: boolean
        }
        Update: {
          created_at?: string
          customer_address?: string
          customer_email?: string
          customer_name?: string
          id?: string
          order_id?: string | null
          shipping_required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "customer_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
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
      order_details: {
        Row: {
          created_at: string
          id: number
          order_id: string | null
          price_at_purchase: number | null
          product_sku: string | null
          quantity: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          order_id?: string | null
          price_at_purchase?: number | null
          product_sku?: string | null
          quantity?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          order_id?: string | null
          price_at_purchase?: number | null
          product_sku?: string | null
          quantity?: number | null
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
            foreignKeyName: "order_details_product_sku_fkey"
            columns: ["product_sku"]
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
      execute_sql: {
        Args: { query_text: string }
        Returns: Json[]
      }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      customer_status: ["active", "inactive", "blocked"],
      customer_type: ["retail", "wholesale", "corporate"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      product_status: ["active", "discontinued", "out_of_stock", "low_stock"],
      shipping_status: [
        "processing",
        "shipped",
        "delivered",
        "delayed",
        "cancelled",
      ],
      supplier_status: ["active", "inactive", "pending_review"],
      transaction_type: [
        "purchase",
        "sale",
        "adjustment",
        "return",
        "transfer",
      ],
    },
  },
} as const
