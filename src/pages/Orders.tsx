import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  ShoppingCart, Package, Truck, CheckCircle, XCircle,
  Clock, AlertCircle, MapPin, User, Phone, Mail,
  CreditCard, DollarSign, Printer, Download, Filter,
  Search, Edit, Eye, Trash2, Copy, MoreVertical,
  RefreshCw, ChevronDown, X, Bell, MessageSquare, FileText,
  BarChart3, TrendingUp, Users, Gift, Award, Zap, Shield, Globe,
  Camera, Mic, Wifi, Battery, PackageCheck, PackageX
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useSwipeable } from 'react-swipeable'
import { useLongPress } from 'use-long-press'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { isMobile } from 'react-device-detect'
import { format, formatDistance, subDays } from 'date-fns'

// ============= TYPES =============
interface Order {
  id: string
  orderNumber: string
  customer: Customer
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid' | 'refunded' | 'failed'
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'shipped' | 'delivered'
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'gift_card'
  shippingMethod: 'standard' | 'express' | 'overnight' | 'pickup'
  shippingAddress: Address
  billingAddress: Address
  createdAt: Date
  updatedAt: Date
  processedAt?: Date
  fulfilledAt?: Date
  cancelledAt?: Date
  notes?: string
  tags: string[]
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  estimatedDelivery?: Date
  deliveredAt?: Date
  refunds?: Refund[]
  fraudScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
  isGift: boolean
  giftMessage?: string
  source: 'website' | 'mobile' | 'pos' | 'marketplace'
  metadata: Record<string, any>
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  ordersCount: number
  totalSpent: number
  tags: string[]
}

interface OrderItem {
  id: string
  productId: string
  sku: string
  name: string
  quantity: number
  price: number
  total: number
  image: string
}

interface Address {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

interface Refund {
  id: string
  amount: number
  reason: string
  status: 'pending' | 'completed' | 'rejected'
  createdAt: Date
}

// ============= KANBAN COLUMN =============
const KanbanColumn: React.FC<{
  title: string
  status: string
  orders: Order[]
  icon: React.ElementType
  color: string
  onOrderClick: (order: Order) => void
  onOrderDrop: (orderId: string, newStatus: string) => void
}> = ({ title, status, orders, icon: Icon, color, onOrderClick, onOrderDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'order',
    drop: (item: { id: string }) => {
      onOrderDrop(item.id, status)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })

  return (
    <div ref={drop} className={`glass-card p-4 h-full min-h-[600px] transition-all ${isOver ? 'ring-2 ring-cosmic-purple scale-105' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}><Icon className="w-4 h-4 text-white" /></div>
          <h3 className="text-white font-medium">{title}</h3>
        </div>
        <span className="text-sm text-gray-400">{orders.length}</span>
      </div>
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {orders.map((order) => (
          <KanbanOrderCard key={order.id} order={order} color={color} onClick={() => onOrderClick(order)} />
        ))}
      </div>
    </div>
  )
}

// ============= KANBAN ORDER CARD =============
const KanbanOrderCard: React.FC<{
  order: Order
  color: string
  onClick: () => void
}> = ({ order, color, onClick }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag] = useDrag({
    type: 'order',
    item: { id: order.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })
  drag(ref)

  return (
    <motion.div ref={ref} layout initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0, scale: isDragging ? 1.05 : 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-dark-hover rounded-xl p-4 cursor-move border-l-4 ${order.riskLevel === 'high' ? 'border-error-red' : order.riskLevel === 'medium' ? 'border-warning-orange' : 'border-transparent'}`}
      onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div><p className="text-white font-medium">{order.orderNumber}</p><p className="text-xs text-gray-400">{order.customer.name}</p></div>
        {order.riskLevel && <span className={`text-xs px-2 py-1 rounded-full ${order.riskLevel === 'high' ? 'bg-error-red/10 text-error-red' : order.riskLevel === 'medium' ? 'bg-warning-orange/10 text-warning-orange' : 'bg-success-green/10 text-success-green'}`}>{order.riskLevel} risk</span>}
      </div>
      <div className="flex -space-x-2 mb-3">
        {order.items.slice(0, 3).map((item, i) => (
          <img key={i} src={item.image} alt={item.name} className="w-8 h-8 rounded-full border-2 border-dark-card object-cover" />
        ))}
        {order.items.length > 3 && <span className="w-8 h-8 rounded-full bg-dark-card border-2 border-dark-card flex items-center justify-center text-xs text-gray-400">+{order.items.length - 3}</span>}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm"><span className="text-gray-400">Total</span><span className="text-white font-bold">${order.total.toFixed(2)}</span></div>
        <div className="flex justify-between text-xs"><span className="text-gray-400">{format(order.createdAt, 'MMM dd')}</span>{order.trackingNumber && <span className="text-cosmic-purple flex items-center"><Truck className="w-3 h-3 mr-1" />Tracking</span>}</div>
      </div>
      <div className="mt-3"><div className="w-full h-1 bg-dark-card rounded-full overflow-hidden"><motion.div className={`h-full bg-gradient-to-r ${color}`} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (Date.now() - order.createdAt.getTime()) / (24 * 60 * 60 * 1000) * 100)}%` }} /></div></div>
    </motion.div>
  )
}

// ============= ORDER DETAILS MODAL =============
const OrderDetailsModal: React.FC<{ order: Order; onClose: () => void; onUpdate: (updated: Order) => void }> = ({ order, onClose, onUpdate }) => {
  const [editedOrder] = useState(order)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-start justify-between mb-6 sticky top-0 bg-dark-card/50 backdrop-blur-xl p-4 -m-6 mb-0 border-b border-dark-border">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${order.status === 'delivered' ? 'bg-success-green/20' : order.status === 'cancelled' ? 'bg-error-red/20' : 'bg-cosmic-purple/20'}`}>
              {order.status === 'delivered' ? <CheckCircle className="w-8 h-8 text-success-green" /> : order.status === 'cancelled' ? <XCircle className="w-8 h-8 text-error-red" /> : <Package className="w-8 h-8 text-cosmic-purple" />}
            </div>
            <div><h3 className="text-2xl font-bold text-white">{order.orderNumber}</h3><p className="text-sm text-gray-400">Placed on {format(order.createdAt, 'MMMM dd, yyyy')}</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-hover rounded"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-4">Customer</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {order.customer.avatar ? <img src={order.customer.avatar} alt={order.customer.name} className="w-12 h-12 rounded-full object-cover" /> :
                      <div className="w-12 h-12 rounded-full bg-cosmic-purple/20 flex items-center justify-center"><User className="w-6 h-6 text-cosmic-purple" /></div>}
                    <div><p className="text-white font-medium">{order.customer.name}</p><p className="text-xs text-gray-400">{order.customer.ordersCount} orders</p></div>
                  </div>
                  <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-300">{order.customer.email}</span></div>
                  <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-300">{order.customer.phone}</span></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-4">Order Items</h4>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 bg-dark-hover rounded-lg mb-2">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1"><p className="text-white font-medium">{item.name}</p><p className="text-sm text-gray-400">SKU: {item.sku}</p></div>
                    <div className="text-right"><p className="text-white">x{item.quantity}</p><p className="text-white font-bold">${item.total.toFixed(2)}</p></div>
                  </div>
                ))}
                <div className="border-t border-dark-border pt-4 space-y-2">
                  <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">${order.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Shipping</span><span className="text-white">${order.shipping.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Tax</span><span className="text-white">${order.tax.toFixed(2)}</span></div>
                  {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-success-green">-${order.discount.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-dark-border"><span className="text-white">Total</span><span className="text-white">${order.total.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-dark-border">
          <button onClick={onClose} className="px-6 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card">Cancel</button>
          <button onClick={() => { onUpdate(editedOrder); onClose(); toast.success('Order updated'); }} className="px-6 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue">Save Changes</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============= MAIN ORDERS PAGE =============
const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => {
      const createdAt = subDays(new Date(), Math.floor(Math.random() * 30))
      return {
        id: `ord-${i}`,
        orderNumber: `ORD-${String(i + 1).padStart(5, '0')}`,
        customer: {
          id: `cust-${i}`,
          name: ['John Smith', 'Emma Watson', 'Michael Chen'][Math.floor(Math.random() * 3)],
          email: `customer${i}@example.com`,
          phone: `+1 555-${Math.floor(Math.random() * 9000)}`,
          avatar: `https://images.unsplash.com/photo-${['1500648767791-00dcc994a43e', '1494790108777-7669c5f07f99'][Math.floor(Math.random() * 2)]}?w=100&h=100&fit=crop`,
          ordersCount: Math.floor(Math.random() * 10),
          totalSpent: Math.random() * 1000,
          tags: []
        },
        items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
          id: `item-${i}-${j}`,
          productId: `prod-${j}`,
          sku: `SKU-${j}`,
          name: ['Wireless Headphones', 'Gaming Mouse', '4K Monitor'][Math.floor(Math.random() * 3)],
          quantity: Math.floor(Math.random() * 3) + 1,
          price: Math.random() * 200 + 20,
          total: 0,
          image: `https://picsum.photos/100/100?random=${i}${j}`
        })),
        subtotal: Math.random() * 500,
        tax: Math.random() * 50,
        shipping: Math.random() * 20,
        discount: Math.random() * 30,
        total: Math.random() * 500 + 50,
        status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)] as any,
        paymentStatus: ['paid', 'unpaid'][Math.floor(Math.random() * 2)] as any,
        fulfillmentStatus: ['unfulfilled', 'fulfilled'][Math.floor(Math.random() * 2)] as any,
        paymentMethod: 'credit_card',
        shippingMethod: 'standard',
        shippingAddress: { firstName: 'John', lastName: 'Doe', address1: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
        billingAddress: { firstName: 'John', lastName: 'Doe', address1: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
        createdAt,
        updatedAt: createdAt,
        tags: [],
        fraudScore: Math.floor(Math.random() * 30),
        riskLevel: 'low',
        isGift: false,
        source: 'website',
        metadata: {}
      }
    })
    setOrders(mockOrders)
    setFilteredOrders(mockOrders)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let filtered = [...orders]
    if (searchQuery) {
      filtered = filtered.filter(o => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(o => o.status === selectedStatus)
    }
    setFilteredOrders(filtered)
  }, [orders, searchQuery, selectedStatus])

  const handleOrderDrop = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o))
    toast.success(`Order moved to ${newStatus}`)
  }

  const handleStatusChange = (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o))
    toast.success(`Order updated`)
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="w-16 h-16 border-4 border-cosmic-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-400">Loading orders...</p></div>
      </div>
    )
  }

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div><h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center"><ShoppingCart className="w-8 h-8 mr-3 text-cosmic-purple" />Orders<span className="ml-3 px-3 py-1 bg-cosmic-purple/20 text-cosmic-purple text-sm rounded-full">{filteredOrders.length} orders</span></h1></div>
          <div className="flex items-center flex-wrap gap-3">
            <button onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')} className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl">{viewMode === 'kanban' ? 'Table' : 'Kanban'}</button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-cosmic-purple" />
          </div>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl text-white min-w-[150px]">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <KanbanColumn key={status} title={status.charAt(0).toUpperCase() + status.slice(1)} status={status}
                orders={filteredOrders.filter(o => o.status === status)}
                icon={status === 'pending' ? Clock : status === 'shipped' ? Truck : status === 'delivered' ? CheckCircle : Package}
                color={status === 'pending' ? 'from-orange-500 to-red-500' : status === 'processing' ? 'from-blue-500 to-cyan-500' : status === 'shipped' ? 'from-green-500 to-emerald-500' : status === 'delivered' ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-pink-500'}
                onOrderClick={(order) => { setSelectedOrder(order); setShowOrderModal(true); }}
                onOrderDrop={handleOrderDrop} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-dark-border">
                <th className="py-3 px-4"><input type="checkbox" checked={selectedOrders.length === filteredOrders.length} onChange={handleSelectAll} className="rounded border-dark-border bg-dark-hover text-cosmic-purple" /></th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Order</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Customer</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Items</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Total</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Status</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Date</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Actions</th>
              </tr></thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-dark-border hover:bg-dark-hover/50 cursor-pointer"
                    onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}>
                    <td className="py-3 px-4"><input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={(e) => { e.stopPropagation(); if (e.target.checked) { setSelectedOrders([...selectedOrders, order.id]) } else { setSelectedOrders(selectedOrders.filter(id => id !== order.id)) } }} className="rounded border-dark-border bg-dark-hover text-cosmic-purple" /></td>
                    <td className="py-3 px-4"><span className="text-white font-medium">{order.orderNumber}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center space-x-3"><img src={order.customer.avatar} alt={order.customer.name} className="w-8 h-8 rounded-full object-cover" /><div><p className="text-white text-sm">{order.customer.name}</p><p className="text-xs text-gray-400">{order.customer.email}</p></div></div></td>
                    <td className="py-3 px-4"><div className="flex -space-x-2">{order.items.slice(0, 2).map((item, i) => <img key={i} src={item.image} alt={item.name} className="w-6 h-6 rounded-full border-2 border-dark-card object-cover" />)}</div></td>
                    <td className="py-3 px-4"><span className="text-white font-bold">${order.total.toFixed(2)}</span></td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-success-green/10 text-success-green' : order.status === 'processing' ? 'bg-warning-orange/10 text-warning-orange' : order.status === 'shipped' ? 'bg-electric-blue/10 text-electric-blue' : 'bg-gray-500/10 text-gray-400'}`}>{order.status}</span></td>
                    <td className="py-3 px-4"><span className="text-sm text-gray-400">{formatDistance(order.createdAt, new Date(), { addSuffix: true })}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center space-x-2"><button onClick={(e) => { e.stopPropagation(); toast.success(`Viewing order`); }} className="p-1 hover:bg-dark-hover rounded"><Eye className="w-4 h-4 text-gray-400" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AnimatePresence>{showOrderModal && selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={() => { setShowOrderModal(false); setSelectedOrder(null); }}
            onUpdate={(updated) => { setOrders(prev => prev.map(o => o.id === updated.id ? updated : o)); }} />
        )}</AnimatePresence>
      </div>
    </DndProvider>
  )
}

export default Orders
