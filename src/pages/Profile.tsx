import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Calendar, Edit, Camera, Save,
  ShoppingBag, DollarSign, TrendingUp, Star, Award,
  Settings, Shield, BadgeCheck, MessageSquare
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useUserStore } from '../store/store'
import { format, formatDistance } from 'date-fns'

// ============================================================================
// TYPES
// ============================================================================

interface Activity {
  id: string
  type: 'order' | 'login' | 'setting' | 'product'
  description: string
  timestamp: Date
  icon: React.ElementType
}

interface Stat {
  id: string
  label: string
  value: string | number
  change?: number
  icon: React.ElementType
  color: string
}

// ============================================================================
// PROFILE PAGE COMPONENT
// ============================================================================

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'security'>('overview')

  const userState = useUserStore()

  // Form state
  const [formData, setFormData] = useState({
    name: userState.name || 'John Doe',
    email: userState.email || 'john@nova.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'E-commerce manager with 5+ years of experience. Passionate about data analytics and customer experience.',
    company: 'NOVA Electronics',
    role: 'Senior Admin',
    website: 'https://johndoe.com',
    twitter: '@johndoe',
    github: '@johndoe'
  })

  // Stats
  const stats: Stat[] = [
    {
      id: 'orders',
      label: 'Total Orders',
      value: 1243,
      change: 12,
      icon: ShoppingBag,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'revenue',
      label: 'Revenue Generated',
      value: '$234,567',
      change: 23,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'products',
      label: 'Products Managed',
      value: 456,
      change: 8,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'reviews',
      label: 'Reviews Written',
      value: 89,
      change: -2,
      icon: Star,
      color: 'from-yellow-500 to-amber-500'
    }
  ]

  // Activity data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'order',
      description: 'Processed order #ORD-12345',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: ShoppingBag
    },
    {
      id: '2',
      type: 'product',
      description: 'Added new product: Wireless Headphones',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: TrendingUp
    },
    {
      id: '3',
      type: 'login',
      description: 'Logged in from Chrome on macOS',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      icon: User
    },
    {
      id: '4',
      type: 'setting',
      description: 'Updated store settings',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: Settings
    }
  ]

  const handleSave = () => {
    userState.updateProfile({
      name: formData.name,
      email: formData.email
    })
    setIsEditing(false)
    toast.success('Profile updated successfully!')
  }

  const handleAvatarChange = () => {
    toast.success('Avatar upload coming soon!')
  }

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center">
            <User className="w-8 h-8 mr-3 text-cosmic-purple" />
            Profile
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your personal information and activity
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 glass-card hover:bg-dark-hover rounded-xl text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-cosmic-purple text-white rounded-xl hover:bg-electric-blue transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={userState.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'}
                  alt={formData.name}
                  className="w-full h-full rounded-full object-cover ring-4 ring-cosmic-purple/50"
                />
                <button
                  onClick={handleAvatarChange}
                  className="absolute bottom-0 right-0 p-2 bg-cosmic-purple rounded-full hover:bg-electric-blue transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Name and role */}
            <div className="text-center mb-6">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-bold text-white text-center bg-dark-hover border border-dark-border rounded-lg px-4 py-2 w-full"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{formData.name}</h2>
              )}
              <p className="text-cosmic-purple mt-1">{formData.role}</p>
              <p className="text-gray-400 text-sm mt-1">{formData.company}</p>
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 text-gray-400 mr-3" />
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-3 py-1 text-sm"
                  />
                ) : (
                  <span className="text-sm">{formData.email}</span>
                )}
              </div>

              <div className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 text-gray-400 mr-3" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-3 py-1 text-sm"
                  />
                ) : (
                  <span className="text-sm">{formData.phone}</span>
                )}
              </div>

              <div className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-3 py-1 text-sm"
                  />
                ) : (
                  <span className="text-sm">{formData.location}</span>
                )}
              </div>

              <div className="flex items-center text-gray-300">
                <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm">Joined {format(new Date(2023, 0, 15), 'MMMM yyyy')}</span>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 pt-6 border-t border-dark-border">
              <h3 className="text-white font-medium mb-2">Bio</h3>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white text-sm"
                />
              ) : (
                <p className="text-gray-400 text-sm">{formData.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Stats and activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex items-center space-x-2 border-b border-dark-border pb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-cosmic-purple text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'bg-cosmic-purple text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-cosmic-purple text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              Security
            </button>
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <motion.div
                    key={stat.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      {stat.change && (
                        <span className={`text-sm font-medium ${
                          stat.change > 0 ? 'text-success-green' : 'text-error-red'
                        }`}>
                          {stat.change > 0 ? '+' : ''}{stat.change}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="glass-card p-6">
                <h3 className="text-white font-medium mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="p-2 bg-dark-hover rounded-lg">
                        <activity.icon className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistance(activity.timestamp, new Date(), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="w-full mt-4 py-2 text-sm text-cosmic-purple hover:text-electric-blue border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
                >
                  View All Activity
                </button>
              </div>

              {/* Achievements */}
              <div className="glass-card p-6">
                <h3 className="text-white font-medium mb-4">Achievements</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-dark-hover rounded-lg">
                      <div className="p-2 bg-gold/20 rounded-lg">
                        <Award className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Top Seller</p>
                        <p className="text-xs text-gray-400">Processed 1000 orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Activity tab */}
          {activeTab === 'activity' && (
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">Activity Timeline</h3>
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="relative">
                      <div className="p-2 bg-dark-hover rounded-lg z-10 relative">
                        <activity.icon className="w-4 h-4 text-cosmic-purple" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-dark-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-white text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistance(activity.timestamp, new Date(), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-white font-medium mb-4">Security Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-hover rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-cosmic-purple" />
                      <div>
                        <p className="text-white text-sm font-medium">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-400">Add an extra layer of security</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-cosmic-purple text-white rounded-lg text-sm hover:bg-electric-blue transition-colors">
                      Enable
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-hover rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BadgeCheck className="w-5 h-5 text-success-green" />
                      <div>
                        <p className="text-white text-sm font-medium">Email Verified</p>
                        <p className="text-xs text-gray-400">Your email is verified</p>
                      </div>
                    </div>
                    <span className="text-success-green text-sm">Verified</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-hover rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-warning-orange" />
                      <div>
                        <p className="text-white text-sm font-medium">Last Password Change</p>
                        <p className="text-xs text-gray-400">30 days ago</p>
                      </div>
                    </div>
                    <button className="text-sm text-cosmic-purple hover:text-electric-blue">
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-hover rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-electric-blue" />
                      <div>
                        <p className="text-white text-sm font-medium">Active Sessions</p>
                        <p className="text-xs text-gray-400">3 active sessions</p>
                      </div>
                    </div>
                    <button className="text-sm text-cosmic-purple hover:text-electric-blue">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
