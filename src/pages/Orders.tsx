import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  ShoppingCart, Package, Truck, CheckCircle, XCircle,
  Clock, AlertCircle, MapPin, User, Phone, Mail,
  CreditCard, DollarSign, Printer, Download, Filter,
  Search, Plus, Edit, Eye, Trash2, Copy, MoreVertical,
  RefreshCw, ChevronDown, ChevronUp, Maximize2, Minimize2,
  Share2, Archive, Bell, MessageSquare, FileText,
  BarChart3, TrendingUp, TrendingDown, Users, Tag,
  Gift, Award, Zap, Shield, Globe, Calendar,
  Camera, Video, Mic, Volume2, VolumeX, Wifi,
  Battery, BatteryCharging, Bluetooth, QrCode,
  Scan, Barcode, PackageCheck, PackageX, Timer
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useSwipeable } from 'react-swipeable'
import { useLongPress } from 'use-long-press'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { isMobile } from 'react-device-detect'
import { format, formatDistance, subDays, subHours } from 'date-fns'
import CountUp from 'react-countup'
import { Line } from 'rc-progress'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

// Fix Leaflet marker issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  paymentMethod: PaymentMethod
  shippingMethod: ShippingMethod
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
  utmSource?: string
  utmCampaign?: string
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
  vip?: boolean
  tags: string[]
}

interface OrderItem {
  id: string
  productId: string
  sku: string
  name: string
  variant?: string
  quantity: number
  price: number
  total: number
  image: string
  returnable: boolean
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
  lat?: number
  lng?: number
}

interface Refund {
  id: string
  amount: number
  reason: string
  status: 'pending' | 'completed' | 'rejected'
  createdAt: Date
  items?: OrderItem[]
}

type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type PaymentStatus = 'paid' | 'unpaid' | 'partially_paid' | 'refunded' | 'failed'
type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'shipped' | 'delivered'
type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'gift_card' | 'crypto'
type ShippingMethod = 'standard' | 'express' | 'overnight' | 'pickup' | 'digital'

// ============= KANBAN COLUMN =============
const KanbanColumn: React.FC<{
  title: string
  status: OrderStatus
  orders: Order[]
  icon: React.ElementType
  color: string
  onOrderClick: (order: Order) => void
  onOrderDrop: (orderId: string, newStatus: OrderStatus) => void
  onStatusChange: (orderId: string, status: OrderStatus) => void
}> = ({ title, status, orders, icon: Icon, color, onOrderClick, onOrderDrop, onStatusChange }) => {
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
    <div
      ref={drop}
      className={`glass-card p-4 h-full min-h-[600px] transition-all ${
        isOver ? 'ring-2 ring-cosmic-purple scale-105' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-white font-medium">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">{orders.length}</span>
          <button className="p-1 hover:bg-dark-hover rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {orders.map((order) => (
          <KanbanOrderCard
            key={order.id}
            order={order}
            color={color}
            onClick={() => onOrderClick(order)}
            onStatusChange={(newStatus) => onStatusChange(order.id, newStatus)}
          />
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
  onStatusChange: (status: OrderStatus) => void
}> = ({ order, color, onClick, onStatusChange }) => {
  const [isDragging, setIsDragging] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging: dragPreview }, drag] = useDrag({
    type: 'order',
    item: { id: order.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: () => setIsDragging(false)
  })

  drag(ref)

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedUp: () => {
      onStatusChange('processing')
      toast.success(`Order ${order.orderNumber} moved to processing`)
    },
    onSwipedDown: () => {
      onStatusChange('cancelled')
      toast.success(`Order ${order.orderNumber} cancelled`)
    },
    onSwipedLeft: () => {
      onStatusChange('shipped')
      toast.success(`Order ${order.orderNumber} marked as shipped`)
    },
    onSwipedRight: () => {
      onStatusChange('delivered')
      toast.success(`Order ${order.orderNumber} marked as delivered`)
    },
    trackMouse: true
  })

  const longPress = useLongPress(() => {
    toast.success(`Quick actions for order ${order.orderNumber}`)
  })

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'text-error-red bg-error-red/10'
      case 'medium': return 'text-warning-orange bg-warning-orange/10'
      case 'low': return 'text-success-green bg-success-green/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  return (
    <motion.div
      ref={ref}
      {...handlers}
      {...longPress}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: dragPreview ? 0.5 : 1,
        y: 0,
        scale: dragPreview ? 1.05 : 1,
        rotate: dragPreview ? -2 : 0
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 30 }}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-dark-hover rounded-xl p-4 cursor-move touch-manipulation border-l-4 ${
        order.riskLevel === 'high' ? 'border-error-red' :
        order.riskLevel === 'medium' ? 'border-warning-orange' :
        'border-transparent'
      }`}
      onClick={onClick}
    >
      {/* Order header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-medium">{order.orderNumber}</p>
          <p className="text-xs text-gray-400">{order.customer.name}</p>
        </div>
        {order.riskLevel && (
          <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(order.riskLevel)}`}>
            {order.riskLevel} risk
          </span>
        )}
      </div>

      {/* Items preview */}
      <div className="flex -space-x-2 mb-3">
        {order.items.slice(0, 3).map((item, i) => (
          <img
            key={i}
            src={item.image}
            alt={item.name}
            className="w-8 h-8 rounded-full border-2 border-dark-card object-cover"
            title={`${item.name} (x${item.quantity})`}
          />
        ))}
        {order.items.length > 3 && (
          <span className="w-8 h-8 rounded-full bg-dark-card border-2 border-dark-card flex items-center justify-center text-xs text-gray-400">
            +{order.items.length - 3}
          </span>
        )}
      </div>

      {/* Order details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total</span>
          <span className="text-white font-bold">${order.total.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Items</span>
          <span className="text-white">{order.items.reduce((sum, i) => sum + i.quantity, 0)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">{format(order.createdAt, 'MMM dd, HH:mm')}</span>
          {order.trackingNumber && (
            <span className="text-cosmic-purple flex items-center">
              <Truck className="w-3 h-3 mr-1" />
              Tracking
            </span>
          )}
        </div>
      </div>

      {/* Progress bar for age */}
      <div className="mt-3">
        <div className="w-full h-1 bg-dark-card rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (Date.now() - order.createdAt.getTime()) / (24 * 60 * 60 * 1000) * 100)}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ============= ORDER TIMELINE =============
const OrderTimeline: React.FC<{
  order: Order
}> = ({ order }) => {
  const events = [
    {
      status: 'pending',
      label: 'Order Placed',
      time: order.createdAt,
      icon: ShoppingCart,
      completed: true
    },
    {
      status: 'processing',
      label: 'Processing',
      time: order.processedAt,
      icon: Package,
      completed: !!order.processedAt
    },
    {
      status: 'shipped',
      label: 'Shipped',
      time: order.fulfilledAt,
      icon: Truck,
      completed: !!order.fulfilledAt
    },
    {
      status: 'delivered',
      label: 'Delivered',
      time: order.deliveredAt,
      icon: CheckCircle,
      completed: !!order.deliveredAt
    }
  ]

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const Icon = event.icon
        const isCompleted = event.completed
        const isActive = !isCompleted && events[index - 1]?.completed

        return (
          <div key={event.status} className="relative">
            {/* Connector line */}
            {index < events.length - 1 && (
              <div
                className={`absolute left-5 top-8 w-0.5 h-12 ${
                  isCompleted ? 'bg-cosmic-purple' : 'bg-dark-border'
                }`}
              />
            )}

            <div className="flex items-start space-x-3">
              <div className={`relative`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-cosmic-purple/20 text-cosmic-purple'
                      : isActive
                      ? 'bg-warning-orange/20 text-warning-orange animate-pulse'
                      : 'bg-dark-hover text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex-1 pt-1">
                <p className={`text-sm font-medium ${
                  isCompleted ? 'text-white' : 'text-gray-400'
                }`}>
                  {event.label}
                </p>
                {event.time && (
                  <p className="text-xs text-gray-500 mt-1">
                    {format(event.time, 'MMM dd, yyyy hh:mm a')}
                  </p>
                )}
                {isActive && (
                  <p className="text-xs text-warning-orange mt-1">In progress...</p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============= ORDER MAP =============
const OrderMap: React.FC<{
  address: Address
}> = ({ address }) => {
  // Default to center of US if no coordinates
  const position: [number, number] = address.lat && address.lng
    ? [address.lat, address.lng]
    : [39.8283, -98.5795]

  return (
    <div className="h-64 rounded-xl overflow-hidden">
      <MapContainer
        center={position}
        zoom={address.lat ? 13 : 4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {address.lat && address.lng && (
          <Marker position={position}>
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{address.firstName} {address.lastName}</p>
                <p>{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

// ============= ORDER TABLE ROW =============
const OrderTableRow: React.FC<{
  order: Order
  isSelected: boolean
  onSelect: () => void
  onClick: () => void
  onStatusChange: (status: OrderStatus) => void
}> = ({ order, isSelected, onSelect, onClick, onStatusChange }) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-warning-orange/10 text-warning-orange'
      case 'processing': return 'bg-electric-blue/10 text-electric-blue'
      case 'confirmed': return 'bg-cosmic-purple/10 text-cosmic-purple'
      case 'shipped': return 'bg-cyan-500/10 text-cyan-400'
      case 'delivered': return 'bg-success-green/10 text-success-green'
      case 'cancelled': return 'bg-error-red/10 text-error-red'
      case 'refunded': return 'bg-gray-500/10 text-gray-400'
      default: return 'bg-gray-500/10 text-gray-400'
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid': return 'text-success-green'
      case 'unpaid': return 'text-warning-orange'
      case 'partially_paid': return 'text-electric-blue'
      case 'refunded': return 'text-gray-400'
      case 'failed': return 'text-error-red'
      default: return 'text-gray-400'
    }
  }

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
      className="border-b border-dark-border cursor-pointer"
      onClick={onClick}
    >
      <td className="py-3 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className="rounded border-dark-border bg-dark-hover text-cosmic-purple"
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${
            order.riskLevel === 'high' ? 'bg-error-red animate-pulse' :
            order.riskLevel === 'medium' ? 'bg-warning-orange' :
            'bg-success-green'
          }`} />
          <span className="text-white font-medium">{order.orderNumber}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          {order.customer.avatar ? (
            <img
              src={order.customer.avatar}
              alt={order.customer.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-cosmic-purple/20 flex items-center justify-center">
              <User className="w-4 h-4 text-cosmic-purple" />
            </div>
          )}
          <div>
            <p className="text-white text-sm">{order.customer.name}</p>
            <p className="text-xs text-gray-400">{order.customer.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex -space-x-2">
          {order.items.slice(0, 3).map((item, i) => (
            <img
              key={i}
              src={item.image}
              alt={item.name}
              className="w-6 h-6 rounded-full border-2 border-dark-card object-cover"
              title={`${item.name} (x${item.quantity})`}
            />
          ))}
          {order.items.length > 3 && (
            <span className="w-6 h-6 rounded-full bg-dark-hover border-2 border-dark-card flex items-center justify-center text-xs text-gray-400">
              +{order.items.length - 3}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-white font-bold">${order.total.toFixed(2)}</span>
      </td>
      <td className="py-3 px-4">
        <select
          value={order.status}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
          className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(order.status)}`}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </td>
      <td className="py-3 px-4">
        <span className={`text-sm ${getPaymentStatusColor(order.paymentStatus)}`}>
          {order.paymentStatus.replace('_', ' ')}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-400">
          {formatDistance(order.createdAt, new Date(), { addSuffix: true })}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              toast.success(`Printing label for ${order.orderNumber}`)
            }}
            className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toast.success(`Emailing customer for ${order.orderNumber}`)
            }}
            className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toast.success(`Contacting customer for ${order.orderNumber}`)
            }}
            className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </td>
    </motion.tr>
  )
}

// ============= ORDER DETAILS MODAL =============
const OrderDetailsModal: React.FC<{
  order: Order
  onClose: () => void
  onUpdate: (updated: Order) => void
}> = ({ order, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'shipping' | 'payment' | 'notes'>('details')
  const [editedOrder, setEditedOrder] = useState(order)

  const handlePrintInvoice = () => {
    toast.success('Printing invoice...')
  }

  const handleDownloadInvoice = () => {
    toast.success('Downloading invoice...')
  }

  const handleEmailInvoice = () => {
    toast.success('Emailing invoice...')
  }

  const handleRefund = () => {
    toast.success('Processing refund...')
  }

  const handleCancel = () => {
    if (window.confirm('Cancel this order?')) {
      setEditedOrder({ ...editedOrder, status: 'cancelled' })
      onUpdate({ ...editedOrder, status: 'cancelled' })
      toast.success('Order cancelled')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative glass-card max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6 sticky top-0 bg-dark-card/50 backdrop-blur-xl p-4 -m-6 mb-0 border-b border-dark-border">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
              order.status === 'delivered' ? 'bg-success-green/20' :
              order.status === 'cancelled' ? 'bg-error-red/20' :
              'bg-cosmic-purple/20'
            }`}>
              {order.status === 'delivered' ? (
                <CheckCircle className="w-8 h-8 text-success-green" />
              ) : order.status === 'cancelled' ? (
                <XCircle className="w-8 h-8 text-error-red" />
              ) : (
                <Package className="w-8 h-8 text-cosmic-purple" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{order.orderNumber}</h3>
              <p className="text-sm text-gray-400">
                Placed on {format(order.createdAt, 'MMMM dd, yyyy at hh:mm a')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintInvoice}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <Printer className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <Download className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={handleEmailInvoice}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-dark-border">
          {[
            { id: 'details', label: 'Order Details', icon: ShoppingCart },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'shipping', label: 'Shipping', icon: Truck },
            { id: 'payment', label: 'Payment', icon: CreditCard },
            { id: 'notes', label: 'Notes', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cosmic-purple text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer info */}
              <div className="lg:col-span-1 space-y-4">
                <div className="glass-card p-4">
                  <h4 className="text-white font-medium mb-4">Customer</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      {order.customer.avatar ? (
                        <img
                          src={order.customer.avatar}
                          alt={order.customer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-cosmic-purple/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-cosmic-purple" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{order.customer.name}</p>
                        <p className="text-xs text-gray-400">
                          {order.customer.ordersCount} orders • ${order.customer.totalSpent.toFixed(2)} total
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{order.customer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{order.customer.phone}</span>
                    </div>
                    {order.customer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {order.customer.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-dark-hover text-gray-300 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Risk assessment */}
                {order.fraudScore && (
                  <div className="glass-card p-4">
                    <h4 className="text-white font-medium mb-4">Risk Assessment</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Risk Level</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          order.riskLevel === 'high' ? 'bg-error-red/10 text-error-red' :
                          order.riskLevel === 'medium' ? 'bg-warning-orange/10 text-warning-orange' :
                          'bg-success-green/10 text-success-green'
                        }`}>
                          {order.riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Fraud Score</span>
                        <span className="text-white">{order.fraudScore}</span>
                      </div>
                      <div className="w-full h-2 bg-dark-card rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            order.fraudScore > 70 ? 'bg-error-red' :
                            order.fraudScore > 40 ? 'bg-warning-orange' :
                            'bg-success-green'
                          }`}
                          style={{ width: `${order.fraudScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order items */}
              <div className="lg:col-span-2">
                <div className="glass-card p-4">
                  <h4 className="text-white font-medium mb-4">Order Items</h4>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-dark-hover rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-sm text-gray-400">SKU: {item.sku}</p>
                          {item.variant && (
                            <p className="text-xs text-gray-500">Variant: {item.variant}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-white">x{item.quantity}</p>
                          <p className="text-sm text-gray-400">${item.price.toFixed(2)}</p>
                          <p className="text-white font-bold">${item.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}

                    {/* Order summary */}
                    <div className="border-t border-dark-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white">${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Shipping</span>
                        <span className="text-white">${order.shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Tax</span>
                        <span className="text-white">${order.tax.toFixed(2)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Discount</span>
                          <span className="text-success-green">-${order.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-dark-border">
                        <span className="text-white">Total</span>
                        <span className="text-white">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-6">Order Timeline</h4>
                <OrderTimeline order={order} />
              </div>
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-4">Activity Log</h4>
                <div className="space-y-3">
                  {[
                    { action: 'Order created', time: order.createdAt, user: 'System' },
                    ...(order.processedAt ? [{ action: 'Order processed', time: order.processedAt, user: 'Admin' }] : []),
                    ...(order.fulfilledAt ? [{ action: 'Order fulfilled', time: order.fulfilledAt, user: 'Warehouse' }] : []),
                    ...(order.deliveredAt ? [{ action: 'Order delivered', time: order.deliveredAt, user: 'Courier' }] : [])
                  ].map((log, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 bg-dark-hover rounded-lg">
                      <div className="w-2 h-2 mt-2 rounded-full bg-cosmic-purple" />
                      <div className="flex-1">
                        <p className="text-white text-sm">{log.action}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">By {log.user}</span>
                          <span className="text-xs text-gray-500">
                            {format(log.time, 'MMM dd, hh:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shipping address */}
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-4">Shipping Address</h4>
                <div className="space-y-2">
                  <p className="text-white">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  {order.shippingAddress.company && (
                    <p className="text-gray-300">{order.shippingAddress.company}</p>
                  )}
                  <p className="text-gray-300">{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && (
                    <p className="text-gray-300">{order.shippingAddress.address2}</p>
                  )}
                  <p className="text-gray-300">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-gray-300">{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="text-gray-300">Phone: {order.shippingAddress.phone}</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-dark-border">
                  <h5 className="text-white text-sm font-medium mb-2">Shipping Method</h5>
                  <p className="text-gray-300 capitalize">{order.shippingMethod.replace('_', ' ')}</p>
                  {order.trackingNumber && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-400">Tracking Number</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">{order.trackingNumber}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(order.trackingNumber!)
                            toast.success('Tracking number copied')
                          }}
                          className="p-1 hover:bg-dark-hover rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-cosmic-purple hover:text-electric-blue mt-1 inline-block"
                        >
                          Track Package →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Billing address */}
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-4">Billing Address</h4>
                <div className="space-y-2">
                  <p className="text-white">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </p>
                  {order.billingAddress.company && (
                    <p className="text-gray-300">{order.billingAddress.company}</p>
                  )}
                  <p className="text-gray-300">{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && (
                    <p className="text-gray-300">{order.billingAddress.address2}</p>
                  )}
                  <p className="text-gray-300">
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                  </p>
                  <p className="text-gray-300">{order.billingAddress.country}</p>
                </div>

                {/* Map */}
                <div className="mt-4 pt-4 border-t border-dark-border">
                  <h5 className="text-white text-sm font-medium mb-2">Delivery Location</h5>
                  <OrderMap address={order.shippingAddress} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-4">Payment Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Payment Method</span>
                    <span className="text-white capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Payment Status</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      order.paymentStatus === 'paid' ? 'bg-success-green/10 text-success-green' :
                      order.paymentStatus === 'unpaid' ? 'bg-warning-orange/10 text-warning-orange' :
                      order.paymentStatus === 'failed' ? 'bg-error-red/10 text-error-red' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {order.paymentStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="text-white font-bold">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Transaction ID</span>
                    <span className="text-white text-sm">TXN-{Math.random().toString(36).substr(2, 12).toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Refunds */}
              {order.refunds && order.refunds.length > 0 && (
                <div className="glass-card p-4">
                  <h4 className="text-white font-medium mb-4">Refunds</h4>
                  <div className="space-y-3">
                    {order.refunds.map((refund) => (
                      <div key={refund.id} className="p-3 bg-dark-hover rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">${refund.amount.toFixed(2)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            refund.status === 'completed' ? 'bg-success-green/10 text-success-green' :
                            refund.status === 'pending' ? 'bg-warning-orange/10 text-warning-orange' :
                            'bg-error-red/10 text-error-red'
                          }`}>
                            {refund.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{refund.reason}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(refund.createdAt, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="glass-card p-4">
              <h4 className="text-white font-medium mb-4">Order Notes</h4>
              <textarea
                value={editedOrder.notes || ''}
                onChange={(e) => setEditedOrder({ ...editedOrder, notes: e.target.value })}
                placeholder="Add notes about this order..."
                rows={6}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-600 resize-none"
              />
              {order.isGift && (
                <div className="mt-4 p-4 bg-cosmic-purple/10 rounded-lg">
                  <h5 className="text-white font-medium mb-2 flex items-center">
                    <Gift className="w-4 h-4 mr-2 text-cosmic-purple" />
                    Gift Message
                  </h5>
                  <p className="text-gray-300">{order.giftMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-dark-border">
          <button
            onClick={handleRefund}
            className="px-4 py-2 bg-warning-orange/20 text-warning-orange rounded-lg hover:bg-warning-orange/30 transition-colors"
          >
            Refund
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-error-red/20 text-error-red rounded-lg hover:bg-error-red/30 transition-colors"
          >
            Cancel Order
          </button>
          <button
            onClick={() => {
              onUpdate(editedOrder)
              onClose()
              toast.success('Order updated')
            }}
            className="px-6 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============= BULK ORDER ACTIONS =============
const BulkOrderActions: React.FC<{
  selectedOrders: string[]
  onAction: (action: string, data?: any) => void
  onClose: () => void
}> = ({ selectedOrders, onAction, onClose }) => {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 glass-card rounded-t-3xl p-6 z-50"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Bulk Actions</h3>
          <p className="text-sm text-gray-400">{selectedOrders.length} orders selected</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onAction('status', 'processing')}
          className="p-4 bg-dark-hover rounded-xl hover:bg-cosmic-purple/20 transition-colors text-center"
        >
          <Package className="w-6 h-6 mx-auto mb-2 text-cosmic-purple" />
          <span className="text-white text-sm">Mark Processing</span>
        </button>
        <button
          onClick={() => onAction('status', 'shipped')}
          className="p-4 bg-dark-hover rounded-xl hover:bg-cosmic-purple/20 transition-colors text-center"
        >
          <Truck className="w-6 h-6 mx-auto mb-2 text-cosmic-purple" />
          <span className="text-white text-sm">Mark Shipped</span>
        </button>
        <button
          onClick={() => onAction('status', 'delivered')}
          className="p-4 bg-dark-hover rounded-xl hover:bg-cosmic-purple/20 transition-colors text-center"
        >
          <CheckCircle className="w-6 h-6 mx-auto mb-2 text-cosmic-purple" />
          <span className="text-white text-sm">Mark Delivered</span>
        </button>
        <button
          onClick={() => onAction('print')}
          className="p-4 bg-dark-hover rounded-xl hover:bg-cosmic-purple/20 transition-colors text-center"
        >
          <Printer className="w-6 h-6 mx-auto mb-2 text-cosmic-purple" />
          <span className="text-white text-sm">Print Labels</span>
        </button>
        <button
          onClick={() => onAction('export')}
          className="p-4 bg-dark-hover rounded-xl hover:bg-cosmic-purple/20 transition-colors text-center"
        >
          <Download className="w-6 h-6 mx-auto mb-2 text-cosmic-purple" />
          <span className="text-white text-sm">Export</span>
        </button>
        <button
          onClick={() => onAction('email')}
          className="p-4 bg-dark-hover rounded-xl hover:bg-cosmic-purple/20 transition-colors text-center"
        >
          <Mail className="w-6 h-6 mx-auto mb-2 text-cosmic-purple" />
          <span className="text-white text-sm">Email Customers</span>
        </button>
        <button
          onClick={() => onAction('cancel')}
          className="p-4 bg-dark-hover rounded-xl hover:bg-error-red/20 transition-colors text-center"
        >
          <XCircle className="w-6 h-6 mx-auto mb-2 text-error-red" />
          <span className="text-white text-sm">Cancel Orders</span>
        </button>
        <button
          onClick={() => onAction('delete')}
          className="p-4 bg-dark-hover rounded-xl hover:bg-error-red/20 transition-colors text-center"
        >
          <Trash2 className="w-6 h-6 mx-auto mb-2 text-error-red" />
          <span className="text-white text-sm">Delete</span>
        </button>
      </div>
    </motion.div>
  )
}

// ============= MAIN ORDERS PAGE =============
const Orders: React.FC = () => {
  // State
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const [showFilters, setShowFilters] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate mock orders
  useEffect(() => {
    const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => {
      const statuses: OrderStatus[] = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled']
      const paymentStatuses: PaymentStatus[] = ['paid', 'unpaid', 'partially_paid', 'refunded', 'failed']
      const fulfillmentStatuses: FulfillmentStatus[] = ['unfulfilled', 'partially_fulfilled', 'fulfilled', 'shipped', 'delivered']
      const paymentMethods: PaymentMethod[] = ['credit_card', 'paypal', 'bank_transfer', 'cash', 'gift_card']
      const shippingMethods: ShippingMethod[] = ['standard', 'express', 'overnight', 'pickup']
      const sources = ['website', 'mobile', 'pos', 'marketplace']
      const riskLevels = ['low', 'medium', 'high'] as const

      const createdAt = subDays(new Date(), Math.floor(Math.random() * 30))
      const total = Math.random() * 500 + 50
      const items = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => ({
        id: `item-${i}-${j}`,
        productId: `prod-${Math.floor(Math.random() * 100)}`,
        sku: `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        name: ['Wireless Headphones', 'Gaming Mouse', '4K Monitor', 'Mechanical Keyboard', 'USB-C Hub'][Math.floor(Math.random() * 5)],
        quantity: Math.floor(Math.random() * 3) + 1,
        price: Math.random() * 200 + 20,
        total: 0,
        image: `https://images.unsplash.com/photo-${[
          '1505740420928-5e560c06d30e',
          '1523275335684-37898b6baf30',
          '1504274066586-511b5b5c6b3b',
          '1526170375885-61d8b1e3a4d0'
        ][Math.floor(Math.random() * 4)]}?w=100&h=100&fit=crop`,
        returnable: Math.random() > 0.2
      }))

      items.forEach(item => item.total = item.price * item.quantity)

      return {
        id: `ord-${i}`,
        orderNumber: `ORD-${String(i + 1).padStart(5, '0')}`,
        customer: {
          id: `cust-${Math.floor(Math.random() * 100)}`,
          name: ['John Smith', 'Emma Watson', 'Michael Chen', 'Sarah Johnson', 'David Brown'][Math.floor(Math.random() * 5)],
          email: `customer${i}@example.com`,
          phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          avatar: Math.random() > 0.5 ? `https://images.unsplash.com/photo-${[
            '1500648767791-00dcc994a43e',
            '1494790108777-7669c5f07f99',
            '1507003211169-0a1dd7228f2d',
            '1438761681033-6461ffad8d80'
          ][Math.floor(Math.random() * 4)]}?w=100&h=100&fit=crop` : undefined,
          ordersCount: Math.floor(Math.random() * 20) + 1,
          totalSpent: Math.random() * 5000 + 100,
          tags: Math.random() > 0.7 ? ['vip', 'repeat'] : []
        },
        items,
        subtotal: items.reduce((sum, item) => sum + item.total, 0),
        tax: total * 0.1,
        shipping: Math.random() * 20,
        discount: Math.random() > 0.7 ? Math.random() * 50 : 0,
        total,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        fulfillmentStatus: fulfillmentStatuses[Math.floor(Math.random() * fulfillmentStatuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        shippingMethod: shippingMethods[Math.floor(Math.random() * shippingMethods.length)],
        shippingAddress: {
          firstName: ['John', 'Emma', 'Michael', 'Sarah', 'David'][Math.floor(Math.random() * 5)],
          lastName: ['Smith', 'Watson', 'Chen', 'Johnson', 'Brown'][Math.floor(Math.random() * 5)],
          address1: `${Math.floor(Math.random() * 9999)} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
          postalCode: String(Math.floor(Math.random() * 90000) + 10000),
          country: 'USA',
          phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          lat: 40.7128 + (Math.random() - 0.5) * 10,
          lng: -74.0060 + (Math.random() - 0.5) * 20
        },
        billingAddress: {
          firstName: ['John', 'Emma', 'Michael', 'Sarah', 'David'][Math.floor(Math.random() * 5)],
          lastName: ['Smith', 'Watson', 'Chen', 'Johnson', 'Brown'][Math.floor(Math.random() * 5)],
          address1: `${Math.floor(Math.random() * 9999)} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
          postalCode: String(Math.floor(Math.random() * 90000) + 10000),
          country: 'USA'
        },
        createdAt,
        updatedAt: createdAt,
        processedAt: Math.random() > 0.3 ? new Date(createdAt.getTime() + 1000 * 60 * 60 * 2) : undefined,
        fulfilledAt: Math.random() > 0.5 ? new Date(createdAt.getTime() + 1000 * 60 * 60 * 24) : undefined,
        deliveredAt: Math.random() > 0.7 ? new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 3) : undefined,
        tags: Math.random() > 0.7 ? ['urgent', 'gift'] : [],
        trackingNumber: Math.random() > 0.5 ? `1Z${Math.random().toString(36).substr(2, 15).toUpperCase()}` : undefined,
        trackingUrl: '#',
        carrier: ['UPS', 'FedEx', 'USPS', 'DHL'][Math.floor(Math.random() * 4)],
        estimatedDelivery: new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 5),
        fraudScore: Math.floor(Math.random() * 100),
        riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
        isGift: Math.random() > 0.8,
        giftMessage: Math.random() > 0.8 ? 'Happy Birthday! Love, Grandma' : undefined,
        source: sources[Math.floor(Math.random() * sources.length)] as any,
        metadata: {}
      }
    })

    setOrders(mockOrders)
    setFilteredOrders(mockOrders)
    setIsLoading(false)
  }, [])

  // Filter orders
  useEffect(() => {
    let filtered = [...orders]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(o => o.status === selectedStatus)
    }

    // Date range filter
    const now = new Date()
    switch (dateRange) {
      case 'today':
        filtered = filtered.filter(o => o.createdAt.toDateString() === now.toDateString())
        break
      case 'week':
        filtered = filtered.filter(o => o.createdAt > subDays(now, 7))
        break
      case 'month':
        filtered = filtered.filter(o => o.createdAt > subDays(now, 30))
        break
    }

    setFilteredOrders(filtered)
  }, [orders, searchQuery, selectedStatus, dateRange])

  // Statistics
  const stats = useMemo(() => {
    const total = filteredOrders.reduce((sum, o) => sum + o.total, 0)
    const average = total / filteredOrders.length || 0
    const pending = filteredOrders.filter(o => o.status === 'pending').length
    const processing = filteredOrders.filter(o => o.status === 'processing').length
    const shipped = filteredOrders.filter(o => o.status === 'shipped').length
    const delivered = filteredOrders.filter(o => o.status === 'delivered').length
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled').length

    return { total, average, pending, processing, shipped, delivered, cancelled }
  }, [filteredOrders])

  // Handlers
  const handleOrderDrop = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    )
    toast.success(`Order moved to ${newStatus}`)
  }

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status } : o)
    )
    toast.success(`Order ${orderId} updated to ${status}`)
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id))
    }
  }

  const handleBulkAction = (action: string, data?: any) => {
    switch (action) {
      case 'status':
        setOrders(prev =>
          prev.map(o =>
            selectedOrders.includes(o.id) ? { ...o, status: data } : o
          )
        )
        toast.success(`Updated ${selectedOrders.length} orders to ${data}`)
        break
      case 'print':
        toast.success(`Printing ${selectedOrders.length} labels`)
        break
      case 'export':
        // Generate CSV
        const csv = selectedOrders.map(id => {
          const order = orders.find(o => o.id === id)
          return `${order?.orderNumber},${order?.customer.name},${order?.total}`
        }).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'orders.csv'
        a.click()
        toast.success(`Exported ${selectedOrders.length} orders`)
        break
      case 'email':
        toast.success(`Emailing ${selectedOrders.length} customers`)
        break
      case 'cancel':
        if (window.confirm(`Cancel ${selectedOrders.length} orders?`)) {
          setOrders(prev =>
            prev.map(o =>
              selectedOrders.includes(o.id) ? { ...o, status: 'cancelled' } : o
            )
          )
          toast.success(`Cancelled ${selectedOrders.length} orders`)
        }
        break
      case 'delete':
        if (window.confirm(`Delete ${selectedOrders.length} orders?`)) {
          setOrders(prev => prev.filter(o => !selectedOrders.includes(o.id)))
          setSelectedOrders([])
          toast.success(`Deleted ${selectedOrders.length} orders`)
        }
        break
    }
    setShowBulkActions(false)
  }

  const handleExportAll = (format: 'csv' | 'excel' | 'pdf') => {
    toast.success(`Exporting all orders as ${format.toUpperCase()}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cosmic-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center">
              <ShoppingCart className="w-8 h-8 mr-3 text-cosmic-purple" />
              Orders
              <span className="ml-3 px-3 py-1 bg-cosmic-purple/20 text-cosmic-purple text-sm rounded-full">
                {filteredOrders.length} orders
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage and track all customer orders
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center flex-wrap gap-4">
            <div className="glass-card px-4 py-2">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-lg font-bold text-white">${stats.total.toFixed(2)}</p>
            </div>
            <div className="glass-card px-4 py-2">
              <p className="text-xs text-gray-400">Average</p>
              <p className="text-lg font-bold text-white">${stats.average.toFixed(2)}</p>
            </div>
            <div className="glass-card px-4 py-2">
              <p className="text-xs text-gray-400">Pending</p>
              <p className="text-lg font-bold text-warning-orange">{stats.pending}</p>
            </div>
            <div className="glass-card px-4 py-2">
              <p className="text-xs text-gray-400">Shipped</p>
              <p className="text-lg font-bold text-electric-blue">{stats.shipped}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search orders by number, customer, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-cosmic-purple focus:outline-none"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl text-white border-none outline-none min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl text-white border-none outline-none min-w-[150px]"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl flex items-center space-x-2"
          >
            {viewMode === 'kanban' ? <Package className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
            <span>{viewMode === 'kanban' ? 'Kanban' : 'Table'}</span>
          </button>

          <button
            onClick={() => handleExportAll('csv')}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>

        {/* View mode */}
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <KanbanColumn
              title="Pending"
              status="pending"
              orders={filteredOrders.filter(o => o.status === 'pending')}
              icon={Clock}
              color="from-orange-500 to-red-500"
              onOrderClick={(order) => {
                setSelectedOrder(order)
                setShowOrderModal(true)
              }}
              onOrderDrop={handleOrderDrop}
              onStatusChange={handleStatusChange}
            />
            <KanbanColumn
              title="Processing"
              status="processing"
              orders={filteredOrders.filter(o => o.status === 'processing')}
              icon={Package}
              color="from-blue-500 to-cyan-500"
              onOrderClick={(order) => {
                setSelectedOrder(order)
                setShowOrderModal(true)
              }}
              onOrderDrop={handleOrderDrop}
              onStatusChange={handleStatusChange}
            />
            <KanbanColumn
              title="Confirmed"
              status="confirmed"
              orders={filteredOrders.filter(o => o.status === 'confirmed')}
              icon={CheckCircle}
              color="from-purple-500 to-pink-500"
              onOrderClick={(order) => {
                setSelectedOrder(order)
                setShowOrderModal(true)
              }}
              onOrderDrop={handleOrderDrop}
              onStatusChange={handleStatusChange}
            />
            <KanbanColumn
              title="Shipped"
              status="shipped"
              orders={filteredOrders.filter(o => o.status === 'shipped')}
              icon={Truck}
              color="from-green-500 to-emerald-500"
              onOrderClick={(order) => {
                setSelectedOrder(order)
                setShowOrderModal(true)
              }}
              onOrderDrop={handleOrderDrop}
              onStatusChange={handleStatusChange}
            />
            <KanbanColumn
              title="Delivered"
              status="delivered"
              orders={filteredOrders.filter(o => o.status === 'delivered')}
              icon={CheckCircle}
              color="from-emerald-500 to-teal-500"
              onOrderClick={(order) => {
                setSelectedOrder(order)
                setShowOrderModal(true)
              }}
              onOrderDrop={handleOrderDrop}
              onStatusChange={handleStatusChange}
            />
            <KanbanColumn
              title="Cancelled"
              status="cancelled"
              orders={filteredOrders.filter(o => o.status === 'cancelled')}
              icon={XCircle}
              color="from-red-500 to-pink-500"
              onOrderClick={(order) => {
                setSelectedOrder(order)
                setShowOrderModal(true)
              }}
              onOrderDrop={handleOrderDrop}
              onStatusChange={handleStatusChange}
            />
            <KanbanColumn
              title="Refunded"
              status="refunded"
              orders={filteredOrders.filter(o => o.status === 'refunded')}
              icon={DollarSign}
              color="from-gray-500 to-gray-600"
              onOrderClick={(order) => {
                setSelectedOrder(order)
                setShowOrderModal(true)
              }}
              onOrderDrop={handleOrderDrop}
              onStatusChange={handleStatusChange}
            />
          </div>
        ) : (
          <div className="glass-card p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length}
                      onChange={handleSelectAll}
                      className="rounded border-dark-border bg-dark-hover text-cosmic-purple"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Payment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <OrderTableRow
                    key={order.id}
                    order={order}
                    isSelected={selectedOrders.includes(order.id)}
                    onSelect={() => {
                      if (selectedOrders.includes(order.id)) {
                        setSelectedOrders(selectedOrders.filter(id => id !== order.id))
                      } else {
                        setSelectedOrders([...selectedOrders, order.id])
                      }
                    }}
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowOrderModal(true)
                    }}
                    onStatusChange={(status) => handleStatusChange(order.id, status)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bulk actions */}
        <AnimatePresence>
          {selectedOrders.length > 0 && (
            <BulkOrderActions
              selectedOrders={selectedOrders}
              onAction={handleBulkAction}
              onClose={() => {
                setSelectedOrders([])
                setShowBulkActions(false)
              }}
            />
          )}
        </AnimatePresence>

        {/* Order details modal */}
        <AnimatePresence>
          {showOrderModal && selectedOrder && (
            <OrderDetailsModal
              order={selectedOrder}
              onClose={() => {
                setShowOrderModal(false)
                setSelectedOrder(null)
              }}
              onUpdate={(updated) => {
                setOrders(prev =>
                  prev.map(o => o.id === updated.id ? updated : o)
                )
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  )
}

export default Orders
