export interface DashboardStats {
  total_sales_today: number
  active_vehicles: number
  active_customers: number
  completed_orders: number
  pending_orders: number
}

export interface SalesTrend {
  date: string
  amount: number
}

export interface TopProduct {
  name: string
  sales: number
}

export interface DashboardData extends DashboardStats {
  sales_trend: SalesTrend[]
  top_products: TopProduct[]
}

export interface Product {
  id: number
  sku: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  category: string
  brand: string
  price: number
  cost: number
  image_url?: string
  requires_refrigeration: boolean
  is_active: boolean
  stock_quantity: number
  min_stock_level: number
  created_at: string
  updated_at: string
}

export interface Outlet {
  id: number
  cr_number: string
  name_ar: string
  name_en?: string
  address: string
  latitude?: number
  longitude?: number
  district?: string
  city: string
  region?: string
  contact_person: string
  phone: string
  email?: string
  credit_limit: number
  current_balance: number
  status: 'active' | 'inactive' | 'suspended'
  is_verified: boolean
  verification_date?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  order_number: string
  outlet_id: number
  sales_rep_id?: number
  driver_id?: number
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  vat_amount: number
  discount_amount: number
  payment_method?: string
  payment_status: 'pending' | 'paid' | 'failed'
  delivery_date?: string
  delivery_time?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  username: string
  email: string
  name_ar: string
  name_en?: string
  role: 'admin' | 'manager' | 'sales_rep' | 'driver'
  phone?: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

// BRAINSAIT: Roadmap and KPI tracking types for SSDP platform
export interface RoadmapPhase {
  phase: number
  name_en: string
  name_ar: string
  duration: string
  progress: number
  status: 'completed' | 'in-progress' | 'planned'
  items: RoadmapItem[]
}

export interface RoadmapItem {
  id: string
  title_en: string
  title_ar: string
  completed: boolean
}

export interface KPIMetric {
  id: string
  name_en: string
  name_ar: string
  current_value: number
  target_value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  category: 'adoption' | 'retention' | 'efficiency' | 'satisfaction' | 'financial'
}

export interface RoadmapData {
  phases: RoadmapPhase[]
  overall_progress: number
  current_phase: number
}

export interface KPIData {
  metrics: KPIMetric[]
  last_updated: string
}
