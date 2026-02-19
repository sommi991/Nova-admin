import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Users, UserPlus, Search, Filter, Download, Upload,
  Mail, Phone, MapPin, Calendar, Star, Award,
  ShoppingBag, DollarSign, CreditCard, MessageSquare,
  Bell, Shield, Edit, Trash2, Copy, MoreVertical,
  RefreshCw, ChevronDown, ChevronUp, X, Check,
  AlertCircle, TrendingUp, TrendingDown, Clock,
  Gift, Heart, ThumbsUp, Share2, Printer,
  Camera, Video, Mic, Volume2, VolumeX,
  BarChart3, PieChart, Activity, Target,
  Sparkles, Zap, Rocket, Crown, Gem,
  Facebook, Twitter, Instagram, Linkedin,
  Globe, Map, Flag, Tag, Hash, Link
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useSwipeable } from 'react-swipeable'
import { useLongPress } from 'use-long-press'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { isMobile } from 'react-device-detect'
import { format, formatDistance, subDays, subMonths } from 'date-fns'
import CountUp from 'react-countup'
import { Line } from 'rc-progress'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import {
  LineChart, Line as ReLine,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts'

// ============= TYPES =============
interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  addresses: Address[]
  tags: string[]
  segments: string[]
  notes?: string

  // Statistics
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  firstOrderDate?: Date
  lastOrderDate?: Date
  lastActiveDate?: Date

  // Engagement
  emailSubscribed: boolean
  smsSubscribed: boolean
  pushSubscribed: boolean
  marketingConsent: boolean
  lastEmailOpened?: Date
  lastEmailClicked?: Date
  lastSmsClicked?: Date

  // Loyalty
  loyaltyPoints: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  referralCode?: string
  referredBy?: string
  referrals: number

  // Reviews
  reviewsCount: number
  averageRating: number
  reviews: Review[]

  // Support
  supportTickets: SupportTicket[]
  satisfactionScore?: number

  // Risk
  riskScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
  isBlocked: boolean
  blockReason?: string

  // Metadata
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  lastIpAddress?: string
  deviceFingerprint?: string
  userAgent?: string

  // Custom fields
  customFields?: Record<string, any>
}

interface Address {
  id: string
  type: 'shipping' | 'billing' | 'both'
  isDefault: boolean
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
  instructions?: string
  lat?: number
  lng?: number
}

interface Review {
  id: string
  productId: string
  productName: string
  productImage: string
  rating: number
  title: string
  content: string
  createdAt: Date
  updatedAt?: Date
  isVerified: boolean
  helpfulCount: number
  unhelpfulCount: number
  response?: {
    content: string
    createdAt: Date
    staffName: string
  }
  images?: string[]
}

interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  messages: TicketMessage[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  assignedTo?: string
}

interface TicketMessage {
  id: string
  content: string
  createdAt: Date
  isStaff: boolean
  staffName?: string
  attachments?: string[]
}

interface Segment {
  id: string
  name: string
  description: string
  conditions: SegmentCondition[]
  customerCount: number
  createdAt: Date
  updatedAt: Date
  isDynamic: boolean
}

interface SegmentCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in_last'
  value: any
  value2?: any
}

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'push'
  segmentId: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  subject?: string
  content: string
  scheduledAt?: Date
  sentAt?: Date
  stats: {
    sent: number
    opened: number
    clicked: number
    converted: number
    revenue: number
  }
}

// ============= 3D CUSTOMER PROFILE CARD =============
const CustomerProfileCard: React.FC<{
  customer: Customer
  onEdit: () => void
  onMessage: () => void
  onBlock: () => void
}> = ({ customer, onEdit, onMessage, onBlock }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setRotateY((x - centerX) / 20)
    setRotateX((centerY - y) / 20)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-slate-300 to-slate-400'
      case 'gold': return 'from-yellow-400 to-amber-500'
      case 'silver': return 'from-gray-300 to-gray-400'
      case 'bronze': return 'from-orange-600 to-amber-700'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="w-5 h-5" />
      case 'gold': return <Award className="w-5 h-5" />
      case 'silver': return <Star className="w-5 h-5" />
      case 'bronze': return <Gem className="w-5 h-5" />
      default: return <Users className="w-5 h-5" />
    }
  }

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY }}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative perspective-1000 h-[500px] cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Front of card */}
      <motion.div
        className={`absolute inset-0 backface-hidden glass-card p-6 ${
          isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative h-full flex flex-col">
          {/* Header with actions */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {customer.avatar ? (
                  <img
                    src={customer.avatar}
                    alt={`${customer.firstName} ${customer.lastName}`}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-cosmic-purple/50"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-cosmic-purple/20 flex items-center justify-center ring-4 ring-cosmic-purple/50">
                    <Users className="w-8 h-8 text-cosmic-purple" />
                  </div>
                )}
                {customer.isBlocked ? (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-error-red rounded-full border-2 border-dark-card flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-dark-card ${
                    customer.lastActiveDate && customer.lastActiveDate > subDays(new Date(), 1)
                      ? 'bg-success-green'
                      : 'bg-gray-500'
                  }`} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {customer.firstName} {customer.lastName}
                </h3>
                <p className="text-sm text-gray-400">{customer.email}</p>
                <p className="text-sm text-gray-400">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMessage()
                }}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onBlock()
                }}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <Shield className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Loyalty tier */}
          <div className={`mt-4 p-3 rounded-lg bg-gradient-to-r ${getTierColor(customer.loyaltyTier)} bg-opacity-10 flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              {getTierIcon(customer.loyaltyTier)}
              <span className="text-white capitalize">{customer.loyaltyTier}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Gift className="w-4 h-4 text-gold" />
              <span className="text-white font-bold">{customer.loyaltyPoints} pts</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-dark-hover rounded-lg">
              <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-cosmic-purple" />
              <p className="text-xs text-gray-400">Orders</p>
              <p className="text-lg font-bold text-white">{customer.totalOrders}</p>
            </div>
            <div className="text-center p-3 bg-dark-hover rounded-lg">
              <DollarSign className="w-4 h-4 mx-auto mb-1 text-success-green" />
              <p className="text-xs text-gray-400">Spent</p>
              <p className="text-lg font-bold text-white">${customer.totalSpent.toFixed(0)}</p>
            </div>
            <div className="text-center p-3 bg-dark-hover rounded-lg">
              <Star className="w-4 h-4 mx-auto mb-1 text-gold" />
              <p className="text-xs text-gray-400">Rating</p>
              <p className="text-lg font-bold text-white">{customer.averageRating.toFixed(1)}</p>
            </div>
          </div>

          {/* Tags */}
          {customer.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-cosmic-purple/20 text-cosmic-purple text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div className="mt-4 flex-1">
            <p className="text-xs text-gray-400 mb-2">Recent Activity</p>
            <div className="space-y-2">
              {customer.lastOrderDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Last order</span>
                  <span className="text-white">
                    {formatDistance(customer.lastOrderDate, new Date(), { addSuffix: true })}
                  </span>
                </div>
              )}
              {customer.lastActiveDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Last active</span>
                  <span className="text-white">
                    {formatDistance(customer.lastActiveDate, new Date(), { addSuffix: true })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Customer since</span>
                <span className="text-white">{format(customer.createdAt, 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Flip hint */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            Click to flip →
          </div>
        </div>
      </motion.div>

      {/* Back of card */}
      <motion.div
        className={`absolute inset-0 backface-hidden glass-card p-6 ${
          isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        animate={{ rotateY: isFlipped ? 360 : 180 }}
        transition={{ duration: 0.6 }}
        style={{ transform: 'rotateY(180deg)' }}
      >
        <div className="h-full flex flex-col">
          <h3 className="text-white font-medium mb-4">Addresses</h3>
          
          <div className="space-y-3 flex-1 overflow-y-auto">
            {customer.addresses.map((address) => (
              <div key={address.id} className="p-3 bg-dark-hover rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-cosmic-purple" />
                    <span className="text-white text-sm capitalize">{address.type}</span>
                  </div>
                  {address.isDefault && (
                    <span className="text-xs bg-success-green/10 text-success-green px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm">
                  {address.firstName} {address.lastName}
                </p>
                {address.company && (
                  <p className="text-gray-400 text-xs">{address.company}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">
                  {address.address1}<br />
                  {address.address2 && <>{address.address2}<br /></>}
                  {address.city}, {address.state} {address.postalCode}<br />
                  {address.country}
                </p>
                {address.phone && (
                  <p className="text-gray-400 text-xs mt-1">Phone: {address.phone}</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsFlipped(false)}
            className="mt-4 py-2 bg-cosmic-purple/20 text-cosmic-purple rounded-lg text-sm hover:bg-cosmic-purple/30 transition-colors"
          >
            Back to Profile
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============= CUSTOMER SEGMENT CARD =============
const SegmentCard: React.FC<{
  segment: Segment
  onEdit: () => void
  onApply: () => void
}> = ({ segment, onEdit, onApply }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-4 cursor-pointer"
      onClick={onApply}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-medium">{segment.name}</h3>
          <p className="text-xs text-gray-400 mt-1">{segment.description}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-white text-sm">{segment.customerCount} customers</span>
        </div>
        {segment.isDynamic && (
          <span className="text-xs bg-cosmic-purple/20 text-cosmic-purple px-2 py-1 rounded-full">
            Dynamic
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-dark-border">
        <p className="text-xs text-gray-400 mb-2">Conditions:</p>
        {segment.conditions.map((condition, i) => (
          <div key={i} className="text-xs text-gray-300">
            {condition.field} {condition.operator} {JSON.stringify(condition.value)}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ============= REVIEW CARD =============
const ReviewCard: React.FC<{
  review: Review
  onRespond: () => void
  onHelpful: () => void
}> = ({ review, onRespond, onHelpful }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-start space-x-3">
        <img
          src={review.productImage}
          alt={review.productName}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-medium">{review.productName}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= review.rating
                          ? 'text-gold fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">{review.rating}.0</span>
              </div>
            </div>
            {review.isVerified && (
              <span className="text-xs bg-success-green/10 text-success-green px-2 py-1 rounded-full">
                Verified
              </span>
            )}
          </div>

          <h4 className="text-white text-sm mt-2">{review.title}</h4>
          <p className="text-gray-400 text-xs mt-1">{review.content}</p>

          {review.images && review.images.length > 0 && (
            <div className="flex space-x-2 mt-2">
              {review.images.map((image, i) => (
                <img
                  key={i}
                  src={image}
                  alt={`Review ${i + 1}`}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {review.response && (
            <div className="mt-3 p-3 bg-cosmic-purple/10 rounded-lg">
              <p className="text-xs text-cosmic-purple mb-1">Response from {review.response.staffName}</p>
              <p className="text-xs text-gray-300">{review.response.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {format(review.response.createdAt, 'MMM dd, yyyy')}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={onHelpful}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{review.helpfulCount}</span>
              </button>
              {!review.response && (
                <button
                  onClick={onRespond}
                  className="text-xs text-cosmic-purple hover:text-electric-blue"
                >
                  Respond
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatDistance(review.createdAt, new Date(), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============= SUPPORT TICKET =============
const SupportTicket: React.FC<{
  ticket: SupportTicket
  onView: () => void
  onAssign: () => void
  onStatusChange: (status: string) => void
}> = ({ ticket, onView, onAssign, onStatusChange }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-error-red/10 text-error-red'
      case 'high': return 'bg-warning-orange/10 text-warning-orange'
      case 'medium': return 'bg-electric-blue/10 text-electric-blue'
      case 'low': return 'bg-success-green/10 text-success-green'
      default: return 'bg-gray-500/10 text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-warning-orange/10 text-warning-orange'
      case 'in_progress': return 'bg-electric-blue/10 text-electric-blue'
      case 'resolved': return 'bg-success-green/10 text-success-green'
      case 'closed': return 'bg-gray-500/10 text-gray-400'
      default: return 'bg-gray-500/10 text-gray-400'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card p-4 cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-white font-medium">{ticket.subject}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority}
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-3 line-clamp-2">
        {ticket.messages[0]?.content}
      </p>

      <div className="flex items-center justify-between">
        <select
          value={ticket.status}
          onChange={(e) => onStatusChange(e.target.value)}
          className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(ticket.status)}`}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <div className="flex items-center space-x-3">
          {ticket.assignedTo && (
            <span className="text-xs text-gray-400">Assigned to {ticket.assignedTo}</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAssign()
            }}
            className="text-xs text-cosmic-purple hover:text-electric-blue"
          >
            Assign
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-border">
        <span className="text-xs text-gray-500">
          Created {formatDistance(ticket.createdAt, new Date(), { addSuffix: true })}
        </span>
        <span className="text-xs text-gray-500">
          {ticket.messages.length} messages
        </span>
      </div>
    </motion.div>
  )
}

// ============= CAMPAIGN CARD =============
const CampaignCard: React.FC<{
  campaign: Campaign
  onEdit: () => void
  onLaunch: () => void
}> = ({ campaign, onEdit, onLaunch }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-success-green/10 text-success-green'
      case 'sending': return 'bg-warning-orange/10 text-warning-orange'
      case 'scheduled': return 'bg-electric-blue/10 text-electric-blue'
      case 'draft': return 'bg-gray-500/10 text-gray-400'
      case 'cancelled': return 'bg-error-red/10 text-error-red'
      default: return 'bg-gray-500/10 text-gray-400'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-medium">{campaign.name}</h3>
          <p className="text-xs text-gray-400 mt-1 capitalize">{campaign.type} Campaign</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(campaign.status)}`}>
          {campaign.status}
        </span>
      </div>

      {campaign.status === 'sent' && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Open Rate</span>
            <span className="text-white">
              {((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-dark-card rounded-full overflow-hidden">
            <div
              className="h-full bg-cosmic-purple"
              style={{ width: `${(campaign.stats.opened / campaign.stats.sent) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Click Rate</span>
            <span className="text-white">
              {((campaign.stats.clicked / campaign.stats.sent) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-dark-card rounded-full overflow-hidden">
            <div
              className="h-full bg-success-green"
              style={{ width: `${(campaign.stats.clicked / campaign.stats.sent) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-2">
            <span className="text-gray-400">Revenue</span>
            <span className="text-white font-bold">${campaign.stats.revenue.toFixed(2)}</span>
          </div>
        </div>
      )}

      {campaign.status === 'scheduled' && campaign.scheduledAt && (
        <div className="mb-3">
          <p className="text-xs text-gray-400">Scheduled for</p>
          <p className="text-sm text-white">{format(campaign.scheduledAt, 'MMM dd, yyyy hh:mm a')}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onEdit}
          className="text-xs text-gray-400 hover:text-white"
        >
          Edit
        </button>
        {campaign.status === 'draft' && (
          <button
            onClick={onLaunch}
            className="text-xs bg-cosmic-purple text-white px-3 py-1 rounded-lg hover:bg-electric-blue"
          >
            Launch
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ============= CUSTOMER DETAILS MODAL =============
const CustomerDetailsModal: React.FC<{
  customer: Customer
  onClose: () => void
  onUpdate: (updated: Customer) => void
}> = ({ customer, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'reviews' | 'support' | 'notes'>('profile')
  const [editedCustomer, setEditedCustomer] = useState(customer)

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
            {customer.avatar ? (
              <img
                src={customer.avatar}
                alt={`${customer.firstName} ${customer.lastName}`}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-cosmic-purple/50"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-cosmic-purple/20 flex items-center justify-center ring-4 ring-cosmic-purple/50">
                <Users className="w-8 h-8 text-cosmic-purple" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-white">
                {customer.firstName} {customer.lastName}
              </h3>
              <p className="text-sm text-gray-400">Customer since {format(customer.createdAt, 'MMMM yyyy')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-dark-border">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'support', label: 'Support', icon: MessageSquare },
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
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-4">Personal Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-300">{customer.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-300">{customer.phone}</span>
                  </div>
                  {customer.dateOfBirth && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-300">
                        {format(customer.dateOfBirth, 'MMMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {customer.gender && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-300 capitalize">{customer.gender}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-4">Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Orders</span>
                    <span className="text-white font-bold">{customer.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Spent</span>
                    <span className="text-white font-bold">${customer.totalSpent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Order</span>
                    <span className="text-white font-bold">${customer.averageOrderValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Loyalty Points</span>
                    <span className="text-gold font-bold">{customer.loyaltyPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Referrals</span>
                    <span className="text-white">{customer.referrals}</span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-4">Communication Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Email</span>
                    <span className={customer.emailSubscribed ? 'text-success-green' : 'text-gray-500'}>
                      {customer.emailSubscribed ? 'Subscribed' : 'Unsubscribed'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">SMS</span>
                    <span className={customer.smsSubscribed ? 'text-success-green' : 'text-gray-500'}>
                      {customer.smsSubscribed ? 'Subscribed' : 'Unsubscribed'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Push</span>
                    <span className={customer.pushSubscribed ? 'text-success-green' : 'text-gray-500'}>
                      {customer.pushSubscribed ? 'Subscribed' : 'Unsubscribed'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Marketing</span>
                    <span className={customer.marketingConsent ? 'text-success-green' : 'text-gray-500'}>
                      {customer.marketingConsent ? 'Consent Given' : 'No Consent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              {customer.riskScore && (
                <div className="glass-card p-4">
                  <h4 className="text-white font-medium mb-4">Risk Assessment</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Level</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        customer.riskLevel === 'high' ? 'bg-error-red/10 text-error-red' :
                        customer.riskLevel === 'medium' ? 'bg-warning-orange/10 text-warning-orange' :
                        'bg-success-green/10 text-success-green'
                      }`}>
                        {customer.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Score</span>
                      <span className="text-white">{customer.riskScore}</span>
                    </div>
                    <div className="w-full h-2 bg-dark-card rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          customer.riskScore > 70 ? 'bg-error-red' :
                          customer.riskScore > 40 ? 'bg-warning-orange' :
                          'bg-success-green'
                        }`}
                        style={{ width: `${customer.riskScore}%` }}
                      />
                    </div>
                    {customer.isBlocked && (
                      <div className="mt-2 p-2 bg-error-red/10 rounded-lg">
                        <p className="text-xs text-error-red">Blocked: {customer.blockReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="glass-card p-4">
              <h4 className="text-white font-medium mb-4">Order History</h4>
              {customer.totalOrders > 0 ? (
                <div className="space-y-3">
                  {/* Would map through actual orders */}
                  <p className="text-gray-400">Order history coming soon...</p>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No orders yet</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-4">Reviews Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{customer.reviewsCount}</p>
                    <p className="text-sm text-gray-400">Total Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gold">{customer.averageRating.toFixed(1)}</p>
                    <p className="text-sm text-gray-400">Average Rating</p>
                  </div>
                </div>
              </div>

              {customer.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onRespond={() => toast.success('Opening response editor')}
                  onHelpful={() => toast.success('Marked as helpful')}
                />
              ))}
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4">
              {customer.supportTickets.length > 0 ? (
                customer.supportTickets.map((ticket) => (
                  <SupportTicket
                    key={ticket.id}
                    ticket={ticket}
                    onView={() => toast.success('Opening ticket')}
                    onAssign={() => toast.success('Assigning ticket')}
                    onStatusChange={(status) => toast.success(`Status changed to ${status}`)}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No support tickets</p>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="glass-card p-4">
              <h4 className="text-white font-medium mb-4">Notes</h4>
              <textarea
                value={editedCustomer.notes || ''}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, notes: e.target.value })}
                placeholder="Add notes about this customer..."
                rows={6}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-600 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-dark-border">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdate(editedCustomer)
              onClose()
              toast.success('Customer updated')
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

// ============= MAIN CUSTOMERS PAGE =============
const Customers: React.FC = () => {
  // State
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('all')
  const [selectedTier, setSelectedTier] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false)
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Chart data
  const [tierDistribution, setTierDistribution] = useState<any[]>([])
  const [acquisitionData, setAcquisitionData] = useState<any[]>([])
  const [activityData, setActivityData] = useState<any[]>([])

  // Generate mock data
  useEffect(() => {
    // Mock customers
    const mockCustomers: Customer[] = Array.from({ length: 100 }, (_, i) => {
      const firstName = ['John', 'Emma', 'Michael', 'Sarah', 'David', 'Lisa', 'James', 'Maria'][Math.floor(Math.random() * 8)]
      const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][Math.floor(Math.random() * 8)]
      const totalOrders = Math.floor(Math.random() * 20) + 1
      const totalSpent = Math.random() * 5000 + 100
      const tiers = ['bronze', 'silver', 'gold', 'platinum'] as const

      return {
        id: `cust-${i}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        avatar: Math.random() > 0.3 ? `https://images.unsplash.com/photo-${[
          '1500648767791-00dcc994a43e',
          '1494790108777-7669c5f07f99',
          '1507003211169-0a1dd7228f2d',
          '1438761681033-6461ffad8d80'
        ][Math.floor(Math.random() * 4)]}?w=200&h=200&fit=crop` : undefined,
        addresses: [
          {
            id: `addr-${i}-1`,
            type: 'both',
            isDefault: true,
            firstName,
            lastName,
            address1: `${Math.floor(Math.random() * 9999)} Main St`,
            city: ['New York', 'Los Angeles', 'Chicago', 'Houston'][Math.floor(Math.random() * 4)],
            state: ['NY', 'CA', 'IL', 'TX'][Math.floor(Math.random() * 4)],
            postalCode: String(Math.floor(Math.random() * 90000) + 10000),
            country: 'USA',
            phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            lat: 40.7128 + (Math.random() - 0.5) * 5,
            lng: -74.0060 + (Math.random() - 0.5) * 5
          }
        ],
        tags: Math.random() > 0.5 ? ['vip', 'repeat', 'high-value'].slice(0, Math.floor(Math.random() * 3) + 1) : [],
        segments: [],
        totalOrders,
        totalSpent,
        averageOrderValue: totalSpent / totalOrders,
        firstOrderDate: subMonths(new Date(), Math.floor(Math.random() * 12)),
        lastOrderDate: subDays(new Date(), Math.floor(Math.random() * 30)),
        lastActiveDate: subDays(new Date(), Math.floor(Math.random() * 7)),
        emailSubscribed: Math.random() > 0.3,
        smsSubscribed: Math.random() > 0.5,
        pushSubscribed: Math.random() > 0.6,
        marketingConsent: Math.random() > 0.2,
        loyaltyPoints: Math.floor(Math.random() * 1000),
        loyaltyTier: tiers[Math.floor(Math.random() * tiers.length)],
        referralCode: `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        referrals: Math.floor(Math.random() * 10),
        reviewsCount: Math.floor(Math.random() * 10),
        averageRating: 3 + Math.random() * 2,
        reviews: [],
        supportTickets: [],
        riskScore: Math.floor(Math.random() * 100),
        riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        isBlocked: Math.random() > 0.95,
        blockReason: Math.random() > 0.95 ? 'Fraud suspicion' : undefined,
        createdAt: subMonths(new Date(), Math.floor(Math.random() * 24)),
        updatedAt: new Date(),
        lastLoginAt: subDays(new Date(), Math.floor(Math.random() * 7))
      }
    })

    setCustomers(mockCustomers)
    setFilteredCustomers(mockCustomers)

    // Mock segments
    const mockSegments: Segment[] = [
      {
        id: 'seg-1',
        name: 'VIP Customers',
        description: 'Customers with high lifetime value',
        conditions: [
          { field: 'totalSpent', operator: 'greater_than', value: 5000 },
          { field: 'totalOrders', operator: 'greater_than', value: 10 }
        ],
        customerCount: mockCustomers.filter(c => c.totalSpent > 5000 && c.totalOrders > 10).length,
        createdAt: subMonths(new Date(), 3),
        updatedAt: new Date(),
        isDynamic: true
      },
      {
        id: 'seg-2',
        name: 'Inactive Customers',
        description: 'No purchase in last 90 days',
        conditions: [
          { field: 'lastOrderDate', operator: 'in_last', value: -90 }
        ],
        customerCount: mockCustomers.filter(c => 
          c.lastOrderDate && c.lastOrderDate < subDays(new Date(), 90)
        ).length,
        createdAt: subMonths(new Date(), 2),
        updatedAt: new Date(),
        isDynamic: true
      },
      {
        id: 'seg-3',
        name: 'Birthday Month',
        description: 'Customers with birthday this month',
        conditions: [
          { field: 'dateOfBirth', operator: 'contains', value: new Date().getMonth() }
        ],
        customerCount: 12,
        createdAt: subMonths(new Date(), 1),
        updatedAt: new Date(),
        isDynamic: true
      }
    ]
    setSegments(mockSegments)

    // Mock campaigns
    const mockCampaigns: Campaign[] = [
      {
        id: 'camp-1',
        name: 'VIP Exclusive Sale',
        type: 'email',
        segmentId: 'seg-1',
        status: 'sent',
        subject: 'Exclusive 20% off just for you!',
        content: 'As one of our valued VIP customers...',
        sentAt: subDays(new Date(), 7),
        stats: {
          sent: 234,
          opened: 187,
          clicked: 98,
          converted: 23,
          revenue: 4567.89
        }
      },
      {
        id: 'camp-2',
        name: 'Re-engagement Campaign',
        type: 'email',
        segmentId: 'seg-2',
        status: 'scheduled',
        subject: 'We miss you! Come back for 15% off',
        content: "It's been a while since your last visit...",
        scheduledAt: subDays(new Date(), -3),
        stats: {
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0
        }
      },
      {
        id: 'camp-3',
        name: 'Birthday Discount',
        type: 'sms',
        segmentId: 'seg-3',
        status: 'draft',
        content: 'Happy Birthday! Enjoy 25% off your next purchase',
        stats: {
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0
        }
      }
    ]
    setCampaigns(mockCampaigns)

    // Chart data
    setTierDistribution([
      { name: 'Bronze', value: mockCustomers.filter(c => c.loyaltyTier === 'bronze').length, color: '#CD7F32' },
      { name: 'Silver', value: mockCustomers.filter(c => c.loyaltyTier === 'silver').length, color: '#C0C0C0' },
      { name: 'Gold', value: mockCustomers.filter(c => c.loyaltyTier === 'gold').length, color: '#FFD700' },
      { name: 'Platinum', value: mockCustomers.filter(c => c.loyaltyTier === 'platinum').length, color: '#E5E4E2' }
    ])

    setAcquisitionData(Array.from({ length: 12 }, (_, i) => ({
      month: format(subMonths(new Date(), 11 - i), 'MMM'),
      customers: Math.floor(Math.random() * 50) + 20
    })))

    setActivityData(Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      active: Math.floor(Math.random() * 100) + 50
    })))

    setIsLoading(false)
  }, [])

  // Filter customers
  useEffect(() => {
    let filtered = [...customers]

    if (searchQuery) {
      filtered = filtered.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      )
    }

    if (selectedSegment !== 'all') {
      const segment = segments.find(s => s.id === selectedSegment)
      if (segment) {
        // Apply segment conditions
        filtered = filtered.filter(c => {
          return segment.conditions.every(condition => {
            switch (condition.field) {
              case 'totalSpent':
                return condition.operator === 'greater_than' ? c.totalSpent > condition.value : c.totalSpent < condition.value
              case 'totalOrders':
                return condition.operator === 'greater_than' ? c.totalOrders > condition.value : c.totalOrders < condition.value
              case 'lastOrderDate':
                if (!c.lastOrderDate) return false
                const daysAgo = (new Date().getTime() - c.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
                return daysAgo > Math.abs(condition.value)
              default:
                return true
            }
          })
        })
      }
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(c => c.loyaltyTier === selectedTier)
    }

    setFilteredCustomers(filtered)
  }, [customers, searchQuery, selectedSegment, selectedTier, segments])

  const stats = useMemo(() => {
    const totalCustomers = filteredCustomers.length
    const totalSpent = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
    const averageSpent = totalSpent / totalCustomers || 0
    const loyalCustomers = filteredCustomers.filter(c => c.loyaltyTier === 'platinum' || c.loyaltyTier === 'gold').length
    const activeToday = filteredCustomers.filter(c => 
      c.lastActiveDate && c.lastActiveDate > subDays(new Date(), 1)
    ).length

    return { totalCustomers, totalSpent, averageSpent, loyalCustomers, activeToday }
  }, [filteredCustomers])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cosmic-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading customers...</p>
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
              <Users className="w-8 h-8 mr-3 text-cosmic-purple" />
              Customers
              <span className="ml-3 px-3 py-1 bg-cosmic-purple/20 text-cosmic-purple text-sm rounded-full">
                {filteredCustomers.length} customers
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage customer relationships and engagement
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center flex-wrap gap-4">
            <div className="glass-card px-4 py-2">
              <p className="text-xs text-gray-400">Active Today</p>
              <p className="text-lg font-bold text-success-green">{stats.activeToday}</p>
            </div>
            <div className="glass-card px-4 py-2">
              <p className="text-xs text-gray-400">Loyal Customers</p>
              <p className="text-lg font-bold text-gold">{stats.loyalCustomers}</p>
            </div>
            <div className="glass-card px-4 py-2">
              <p className="text-xs text-gray-400">Avg Spend</p>
              <p className="text-lg font-bold text-white">${stats.averageSpent.toFixed(0)}</p>
            </div>
            <button
              onClick={() => setShowCampaignBuilder(true)}
              className="px-4 py-2 bg-cosmic-purple/20 text-cosmic-purple rounded-xl hover:bg-cosmic-purple/30 transition-colors flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tier Distribution */}
          <div className="glass-card p-4">
            <h3 className="text-white font-medium mb-4">Customer Tiers</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1A1A24', border: '1px solid #333', borderRadius: '8px' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Acquisition */}
          <div className="glass-card p-4">
            <h3 className="text-white font-medium mb-4">Customer Acquisition</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={acquisitionData}>
                <defs>
                  <linearGradient id="acquisitionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ background: '#1A1A24', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="customers"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#acquisitionGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Activity */}
          <div className="glass-card p-4">
            <h3 className="text-white font-medium mb-4">24h Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ background: '#1A1A24', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Bar dataKey="active" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segments Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {segments.map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              onEdit={() => setShowSegmentBuilder(true)}
              onApply={() => {
                setSelectedSegment(segment.id)
                toast.success(`Applied ${segment.name} segment`)
              }}
            />
          ))}
          <button
            onClick={() => setShowSegmentBuilder(true)}
            className="glass-card p-4 border-2 border-dashed border-dark-border hover:border-cosmic-purple transition-colors flex flex-col items-center justify-center"
          >
            <UserPlus className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-gray-400">Create Segment</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search customers by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-cosmic-purple focus:outline-none"
            />
          </div>

          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl text-white border-none outline-none min-w-[150px]"
          >
            <option value="all">All Segments</option>
            {segments.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl text-white border-none outline-none min-w-[150px]"
          >
            <option value="all">All Tiers</option>
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl flex items-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>More Filters</span>
          </button>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCustomers.slice(0, 20).map((customer) => (
            <CustomerProfileCard
              key={customer.id}
              customer={customer}
              onEdit={() => {
                setSelectedCustomer(customer)
                setShowCustomerModal(true)
              }}
              onMessage={() => toast.success(`Messaging ${customer.firstName}`)}
              onBlock={() => {
                if (customer.isBlocked) {
                  toast.success('Customer unblocked')
                } else {
                  toast.error('Customer blocked')
                }
              }}
            />
          ))}
        </div>

        {/* Campaigns Row */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Active Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onEdit={() => setShowCampaignBuilder(true)}
                onLaunch={() => toast.success('Campaign launched!')}
              />
            ))}
          </div>
        </div>

        {/* Customer Details Modal */}
        <AnimatePresence>
          {showCustomerModal && selectedCustomer && (
            <CustomerDetailsModal
              customer={selectedCustomer}
              onClose={() => {
                setShowCustomerModal(false)
                setSelectedCustomer(null)
              }}
              onUpdate={(updated) => {
                setCustomers(prev =>
                  prev.map(c => c.id === updated.id ? updated : c)
                )
              }}
            />
          )}
        </AnimatePresence>

        {/* Segment Builder Modal */}
        <AnimatePresence>
          {showSegmentBuilder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowSegmentBuilder(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative glass-card max-w-2xl w-full rounded-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Create Segment</h3>
                  <button
                    onClick={() => setShowSegmentBuilder(false)}
                    className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Segment Name"
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                  <textarea
                    placeholder="Description"
                    rows={3}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white resize-none"
                  />
                  
                  <div className="p-4 bg-dark-hover rounded-lg">
                    <p className="text-white text-sm mb-3">Conditions</p>
                    <select className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white mb-2">
                      <option>Total Spent</option>
                      <option>Number of Orders</option>
                      <option>Last Order Date</option>
                      <option>Loyalty Tier</option>
                    </select>
                    <select className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white mb-2">
                      <option>Greater than</option>
                      <option>Less than</option>
                      <option>Equals</option>
                      <option>In last (days)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Value"
                      className="w-full bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <button className="text-sm text-cosmic-purple hover:text-electric-blue">
                    + Add Condition
                  </button>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowSegmentBuilder(false)}
                    className="px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowSegmentBuilder(false)
                      toast.success('Segment created')
                    }}
                    className="px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue"
                  >
                    Create Segment
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campaign Builder Modal */}
        <AnimatePresence>
          {showCampaignBuilder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCampaignBuilder(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative glass-card max-w-2xl w-full rounded-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Create Campaign</h3>
                  <button
                    onClick={() => setShowCampaignBuilder(false)}
                    className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Campaign Name"
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />

                  <select className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white">
                    <option>Email Campaign</option>
                    <option>SMS Campaign</option>
                    <option>Push Notification</option>
                  </select>

                  <select className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white">
                    {segments.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Subject Line"
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />

                  <textarea
                    placeholder="Campaign Content"
                    rows={6}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white resize-none"
                  />

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-dark-border bg-dark-hover" />
                      <span className="text-sm text-gray-300">Schedule for later</span>
                    </label>
                    <input
                      type="datetime-local"
                      className="bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCampaignBuilder(false)}
                    className="px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowCampaignBuilder(false)
                      toast.success('Campaign created')
                    }}
                    className="px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue"
                  >
                    Create Campaign
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  )
}

export default Customers
