import React, { useState, useEffect } from 'react'
import {
  Users, UserPlus, Search, Filter, Download, Mail,
  Phone, MapPin, Calendar, Star, Award,
  ShoppingBag, DollarSign, MessageSquare,
  Shield, Edit, Trash2, Copy, X, AlertCircle,
  TrendingUp, Clock, Gift, ThumbsUp,
  BarChart3, PieChart, Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { isMobile } from 'react-device-detect'
import { format, formatDistance, subDays, subMonths } from 'date-fns'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts'

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
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  firstOrderDate?: Date
  lastOrderDate?: Date
  lastActiveDate?: Date
  emailSubscribed: boolean
  smsSubscribed: boolean
  loyaltyPoints: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  referrals: number
  reviewsCount: number
  averageRating: number
  createdAt: Date
  status: 'active' | 'inactive' | 'blocked'
  isBlocked: boolean
}

interface Address {
  id: string
  type: 'shipping' | 'billing' | 'both'
  isDefault: boolean
  firstName: string
  lastName: string
  address1: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

// ============= CUSTOMER PROFILE CARD =============
const CustomerProfileCard: React.FC<{
  customer: Customer
  onEdit: () => void
  onMessage: () => void
}> = ({ customer, onEdit, onMessage }) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {customer.avatar ? (
            <img src={customer.avatar} alt={customer.firstName} className="w-12 h-12 rounded-full object-cover ring-2 ring-cosmic-purple/50" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-cosmic-purple/20 flex items-center justify-center"><Users className="w-6 h-6 text-cosmic-purple" /></div>
          )}
          <div><h3 className="text-white font-medium">{customer.firstName} {customer.lastName}</h3><p className="text-xs text-gray-400">{customer.email}</p></div>
        </div>
        {customer.isBlocked && <div className="w-2 h-2 bg-error-red rounded-full" />}
      </div>

      <div className={`p-2 rounded-lg bg-gradient-to-r ${customer.loyaltyTier === 'platinum' ? 'from-slate-300 to-slate-400' : customer.loyaltyTier === 'gold' ? 'from-yellow-400 to-amber-500' : customer.loyaltyTier === 'silver' ? 'from-gray-300 to-gray-400' : 'from-orange-600 to-amber-700'} bg-opacity-10 flex items-center justify-between mb-3`}>
        <span className="text-white capitalize text-sm">{customer.loyaltyTier}</span>
        <span className="text-white text-sm font-bold">{customer.loyaltyPoints} pts</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-dark-hover rounded"><ShoppingBag className="w-4 h-4 mx-auto mb-1 text-cosmic-purple" /><p className="text-xs text-gray-400">Orders</p><p className="text-sm font-bold text-white">{customer.totalOrders}</p></div>
        <div className="text-center p-2 bg-dark-hover rounded"><DollarSign className="w-4 h-4 mx-auto mb-1 text-success-green" /><p className="text-xs text-gray-400">Spent</p><p className="text-sm font-bold text-white">${customer.totalSpent.toFixed(0)}</p></div>
        <div className="text-center p-2 bg-dark-hover rounded"><Star className="w-4 h-4 mx-auto mb-1 text-gold" /><p className="text-xs text-gray-400">Rating</p><p className="text-sm font-bold text-white">{customer.averageRating.toFixed(1)}</p></div>
      </div>

      {customer.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {customer.tags.map((tag, i) => <span key={i} className="px-2 py-0.5 bg-cosmic-purple/20 text-cosmic-purple text-xs rounded-full">#{tag}</span>)}
        </div>
      )}

      <div className="text-xs text-gray-400 space-y-1">
        {customer.lastOrderDate && <div className="flex justify-between"><span>Last order</span><span className="text-white">{formatDistance(customer.lastOrderDate, new Date(), { addSuffix: true })}</span></div>}
        <div className="flex justify-between"><span>Customer since</span><span className="text-white">{format(customer.createdAt, 'MMM yyyy')}</span></div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-border">
        <button onClick={onMessage} className="text-xs text-cosmic-purple hover:text-electric-blue">Message</button>
        <button onClick={onEdit} className="p-1 hover:bg-dark-hover rounded"><Edit className="w-4 h-4 text-gray-400" /></button>
      </div>
    </motion.div>
  )
}

// ============= CUSTOMER DETAILS MODAL =============
const CustomerDetailsModal: React.FC<{ customer: Customer; onClose: () => void; onUpdate: (updated: Customer) => void }> = ({ customer, onClose, onUpdate }) => {
  const [editedCustomer] = useState(customer)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-start justify-between mb-6 sticky top-0 bg-dark-card/50 backdrop-blur-xl p-4 -m-6 mb-0 border-b border-dark-border">
          <div className="flex items-center space-x-4">
            {customer.avatar ? <img src={customer.avatar} alt={customer.firstName} className="w-16 h-16 rounded-full object-cover ring-4 ring-cosmic-purple/50" /> :
              <div className="w-16 h-16 rounded-full bg-cosmic-purple/20 flex items-center justify-center"><Users className="w-8 h-8 text-cosmic-purple" /></div>}
            <div><h3 className="text-2xl font-bold text-white">{customer.firstName} {customer.lastName}</h3><p className="text-sm text-gray-400">Customer since {format(customer.createdAt, 'MMMM yyyy')}</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-hover rounded"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-4">
            <h4 className="text-white font-medium mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center"><Mail className="w-4 h-4 text-gray-400 mr-3" /><span className="text-gray-300">{customer.email}</span></div>
              <div className="flex items-center"><Phone className="w-4 h-4 text-gray-400 mr-3" /><span className="text-gray-300">{customer.phone}</span></div>
              {customer.dateOfBirth && <div className="flex items-center"><Calendar className="w-4 h-4 text-gray-400 mr-3" /><span className="text-gray-300">{format(customer.dateOfBirth, 'MMMM dd, yyyy')}</span></div>}
            </div>
          </div>

          <div className="glass-card p-4">
            <h4 className="text-white font-medium mb-4">Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-400">Total Orders</span><span className="text-white font-bold">{customer.totalOrders}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Spent</span><span className="text-white font-bold">${customer.totalSpent.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Loyalty Points</span><span className="text-gold font-bold">{customer.loyaltyPoints}</span></div>
            </div>
          </div>

          <div className="glass-card p-4 lg:col-span-2">
            <h4 className="text-white font-medium mb-4">Addresses</h4>
            {customer.addresses.map((address) => (
              <div key={address.id} className="p-3 bg-dark-hover rounded-lg mb-2">
                <div className="flex items-center justify-between mb-1"><div className="flex items-center"><MapPin className="w-4 h-4 text-cosmic-purple mr-2" /><span className="text-white text-sm capitalize">{address.type}</span></div>{address.isDefault && <span className="text-xs bg-success-green/10 text-success-green px-2 py-0.5 rounded-full">Default</span>}</div>
                <p className="text-gray-300 text-xs">{address.address1}, {address.city}, {address.state} {address.postalCode}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-dark-border">
          <button onClick={onClose} className="px-6 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card">Cancel</button>
          <button onClick={() => { onUpdate(editedCustomer); onClose(); toast.success('Customer updated'); }} className="px-6 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue">Save Changes</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============= MAIN CUSTOMERS PAGE =============
const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState('all')
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const mockCustomers: Customer[] = Array.from({ length: 50 }, (_, i) => {
      const firstName = ['John', 'Emma', 'Michael', 'Sarah'][Math.floor(Math.random() * 4)]
      const lastName = ['Smith', 'Johnson', 'Williams', 'Brown'][Math.floor(Math.random() * 4)]
      const tiers = ['bronze', 'silver', 'gold', 'platinum'] as const
      return {
        id: `cust-${i}`,
        firstName, lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+1 555-${Math.floor(Math.random() * 9000)}`,
        avatar: Math.random() > 0.3 ? `https://images.unsplash.com/photo-${['1500648767791-00dcc994a43e', '1494790108777-7669c5f07f99'][Math.floor(Math.random() * 2)]}?w=200&h=200&fit=crop` : undefined,
        addresses: [{
          id: `addr-${i}`, type: 'both', isDefault: true, firstName, lastName,
          address1: `${Math.floor(Math.random() * 9999)} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago'][Math.floor(Math.random() * 3)],
          state: ['NY', 'CA', 'IL'][Math.floor(Math.random() * 3)],
          postalCode: '10001', country: 'USA'
        }],
        tags: Math.random() > 0.5 ? ['vip', 'repeat'] : [],
        totalOrders: Math.floor(Math.random() * 20),
        totalSpent: Math.random() * 5000,
        averageOrderValue: 150,
        firstOrderDate: subMonths(new Date(), Math.floor(Math.random() * 12)),
        lastOrderDate: subDays(new Date(), Math.floor(Math.random() * 30)),
        lastActiveDate: subDays(new Date(), Math.floor(Math.random() * 7)),
        emailSubscribed: Math.random() > 0.3,
        smsSubscribed: Math.random() > 0.5,
        loyaltyPoints: Math.floor(Math.random() * 1000),
        loyaltyTier: tiers[Math.floor(Math.random() * tiers.length)],
        referrals: Math.floor(Math.random() * 5),
        reviewsCount: Math.floor(Math.random() * 10),
        averageRating: 3 + Math.random() * 2,
        createdAt: subMonths(new Date(), Math.floor(Math.random() * 12)),
        status: 'active',
        isBlocked: false
      }
    })
    setCustomers(mockCustomers)
    setFilteredCustomers(mockCustomers)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let filtered = [...customers]
    if (searchQuery) {
      filtered = filtered.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (selectedTier !== 'all') {
      filtered = filtered.filter(c => c.loyaltyTier === selectedTier)
    }
    setFilteredCustomers(filtered)
  }, [customers, searchQuery, selectedTier])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="w-16 h-16 border-4 border-cosmic-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-400">Loading customers...</p></div>
      </div>
    )
  }

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div><h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center"><Users className="w-8 h-8 mr-3 text-cosmic-purple" />Customers<span className="ml-3 px-3 py-1 bg-cosmic-purple/20 text-cosmic-purple text-sm rounded-full">{filteredCustomers.length} customers</span></h1></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-cosmic-purple" />
          </div>
          <select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl text-white min-w-[150px]">
            <option value="all">All Tiers</option>
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerProfileCard key={customer.id} customer={customer}
              onEdit={() => { setSelectedCustomer(customer); setShowCustomerModal(true); }}
              onMessage={() => toast.success(`Messaging ${customer.firstName}`)} />
          ))}
        </div>

        <AnimatePresence>{showCustomerModal && selectedCustomer && (
          <CustomerDetailsModal customer={selectedCustomer} onClose={() => { setShowCustomerModal(false); setSelectedCustomer(null); }}
            onUpdate={(updated) => { setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c)); }} />
        )}</AnimatePresence>
      </div>
    </DndProvider>
  )
}

export default Customers
