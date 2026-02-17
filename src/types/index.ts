export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'viewer'
  lastActive: Date
}

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  cost: number
  stock: number
  category: string
  status: 'active' | 'draft' | 'archived'
  images: string[]
  variants?: ProductVariant[]
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  attributes: Record<string, string>
}

export interface Order {
  id: string
  orderNumber: string
  customer: Customer
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  paymentMethod: string
  shippingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  name: string
  sku: string
  quantity: number
  price: number
  total: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: Date
  status: 'active' | 'inactive' | 'vip'
  tags: string[]
  createdAt: Date
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface RevenueMetric {
  date: string
  revenue: number
  orders: number
  customers: number
}

export interface AIInsight {
  id: string
  type: 'prediction' | 'alert' | 'recommendation' | 'trend'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  action?: string
  value?: number
  change?: number
  createdAt: Date
}

export interface DashboardStats {
  revenue: {
    total: number
    change: number
    history: RevenueMetric[]
  }
  orders: {
    total: number
    change: number
    pending: number
    processing: number
  }
  customers: {
    total: number
    change: number
    active: number
    new: number
  }
  products: {
    total: number
    lowStock: number
    outOfStock: number
  }
}
