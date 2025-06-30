import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de la base de datos
export interface Product {
  id: string
  codigo: string
  name: string
  sector_id: string | null
  quantity: number
  format: string | null
  type: string | null
  min_stock: number
  monthly_demand: number
  total_demand: number
  created_at: string
  updated_at: string
}

export interface Sector {
  id: string
  name: string
  color: string
  x: number
  y: number
  width: number
  height: number
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: string
  product_id: string
  movement_type: "entrada" | "salida" | "ajuste" | "transferencia"
  quantity: number
  previous_quantity: number
  new_quantity: number
  reason: string | null
  user_name: string | null
  created_at: string
}

export interface StockAlert {
  id: string
  product_id: string
  alert_type: "stock_bajo" | "stock_critico" | "sin_stock"
  message: string
  is_resolved: boolean
  created_at: string
  resolved_at: string | null
}
