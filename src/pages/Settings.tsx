import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, User, Bell, Shield, CreditCard,
  Globe, Mail, Smartphone, Lock, Moon, Sun, Languages,
  Palette, Clock, Download, Upload, RefreshCw, Save,
  Trash2, AlertCircle, CheckCircle, XCircle, Eye,
  EyeOff, Volume2, Wifi, Battery, Printer, Share2,
  Link, Code, Database, Cloud, Server, HardDrive,
  Users, ShoppingBag, Package, DollarSign, TrendingUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useUserStore, useUIStore } from '../store/store'

// ============================================================================
// TYPES
// ============================================================================

interface SettingSection {
  id: string
  title: string
  icon: React.ElementType
  description: string
}

interface SettingField {
  id: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'toggle' | 'radio' | 'slider' | 'color' | 'image'
  value: any
  options?: { label: string; value: any }[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
  help?: string
  validation?: (value: any) => boolean | string
  onChange?: (value: any) => void
}

// ============================================================================
// SETTING SECTIONS
// ============================================================================

const SECTIONS: SettingSection[] = [
  {
    id: 'profile',
    title: 'Profile',
    icon: User,
    description: 'Manage your personal information'
  },
  {
    id: 'account',
    title: 'Account',
    icon: Shield,
    description: 'Security and account settings'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    description: 'Configure how you receive alerts'
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: Palette,
    description: 'Customize the look and feel'
  },
  {
    id: 'store',
    title: 'Store Settings',
    icon: ShoppingBag,
    description: 'Manage your e-commerce store'
  },
  {
    id: 'billing',
    title: 'Billing',
    icon: CreditCard,
    description: 'Payment methods and invoices'
  },
  {
    id: 'team',
    title: 'Team',
    icon: Users,
    description: 'Manage team members and permissions'
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Link,
    description: 'Connect with third-party services'
  },
  {
    id: 'data',
    title: 'Data Management',
    icon: Database,
    description: 'Import, export, and backup data'
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: Server,
    description: 'Developer settings and API'
  }
]

// ============================================================================
// SETTING CARD COMPONENT
// ============================================================================

const SettingCard: React.FC<{
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
  active?: boolean
}> = ({ icon: Icon, title, description, onClick, active }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-start space-x-4 p-4 rounded-xl transition-all ${
        active
          ? 'bg-cosmic-purple/20 border-l-4 border-cosmic-purple'
          : 'bg-dark-hover hover:bg-dark-card'
      }`}
    >
      <div className={`p-3 rounded-xl ${
        active ? 'bg-cosmic-purple/30' : 'bg-dark-card'
      }`}>
        <Icon className={`w-5 h-5 ${
          active ? 'text-cosmic-purple' : 'text-gray-400'
        }`} />
      </div>
      <div className="flex-1 text-left">
        <h3 className={`text-sm font-medium ${
          active ? 'text-cosmic-purple' : 'text-white'
        }`}>
          {title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
    </motion.button>
  )
}

// ============================================================================
// SETTING FIELD COMPONENTS
// ============================================================================

const TextField: React.FC<SettingField> = ({ label, value, placeholder, help, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-cosmic-purple focus:outline-none transition-colors"
      />
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  )
}

const ToggleField: React.FC<SettingField> = ({ label, value, help, onChange }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
        {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
      </div>
      <button
        onClick={() => onChange?.(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-cosmic-purple' : 'bg-dark-border'
        }`}
      >
        <motion.div
          animate={{ x: value ? 24 : 0 }}
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
        />
      </button>
    </div>
  )
}

const SelectField: React.FC<SettingField> = ({ label, value, options, help, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white focus:border-cosmic-purple focus:outline-none"
      >
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  )
}

const SliderField: React.FC<SettingField> = ({ label, value, min, max, step, help, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
        <span className="text-sm text-white">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer"
      />
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  )
}

const ColorField: React.FC<SettingField> = ({ label, value, help, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
        />
      </div>
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  )
}

const ImageField: React.FC<SettingField> = ({ label, value, help, onChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange?.(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-4">
        {value && (
          <img
            src={value}
            alt={label}
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={`file-${label}`}
          />
          <label
            htmlFor={`file-${label}`}
            className="inline-flex items-center px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </label>
        </div>
      </div>
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  )
}

// ============================================================================
// SETTINGS PAGE COMPONENT
// ============================================================================

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const userState = useUserStore()
  const uiState = useUIStore()

  // Form state
  const [formData, setFormData] = useState({
    // Profile
    name: userState.name || 'John Doe',
    email: userState.email || 'john@nova.com',
    phone: '+1 (555) 123-4567',
    bio: 'E-commerce manager with 5+ years of experience',
    avatar: userState.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
    
    // Account
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: 30,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    inventoryAlerts: true,
    marketingAlerts: false,
    
    // Appearance
    theme: uiState.theme,
    sidebarPosition: 'left',
    compactMode: false,
    fontSize: 'medium',
    primaryColor: '#8B5CF6',
    
    // Store
    storeName: 'NOVA Electronics',
    storeEmail: 'store@nova.com',
    storePhone: '+1 (555) 987-6543',
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'en',
    
    // Billing
    plan: 'pro',
    cardLast4: '4242',
    cardExpiry: '05/26',
    
    // Team
    teamMembers: 5,
    teamInvites: 2,
    
    // Data
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 90
  })

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update stores
    userState.updateProfile({
      name: formData.name,
      email: formData.email,
      avatar: formData.avatar
    })
    
    uiState.setTheme(formData.theme as 'dark' | 'light')
    
    toast.success('Settings saved successfully!')
    setIsSaving(false)
  }

  const handleReset = () => {
    setShowResetConfirm(true)
  }

  const confirmReset = () => {
    // Reset to defaults
    setFormData({
      ...formData,
      name: 'John Doe',
      email: 'john@nova.com',
      phone: '+1 (555) 123-4567',
      bio: '',
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: 30,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      orderAlerts: true,
      inventoryAlerts: true,
      marketingAlerts: false,
      theme: 'dark',
      sidebarPosition: 'left',
      compactMode: false,
      fontSize: 'medium',
      primaryColor: '#8B5CF6',
      storeName: 'NOVA Electronics',
      storeEmail: 'store@nova.com',
      storePhone: '+1 (555) 987-6543',
      currency: 'USD',
      timezone: 'America/New_York',
      language: 'en',
      plan: 'pro',
      cardLast4: '4242',
      cardExpiry: '05/26',
      teamMembers: 5,
      teamInvites: 2,
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 90
    })
    
    setShowResetConfirm(false)
    toast.success('Settings reset to defaults')
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Profile Information</h3>
            
            <ImageField
              id="avatar"
              label="Profile Picture"
              value={formData.avatar}
              help="Recommended size: 256x256px"
              onChange={(value) => setFormData({ ...formData, avatar: value })}
            />
            
            <TextField
              id="name"
              label="Full Name"
              value={formData.name}
              placeholder="Enter your full name"
              onChange={(value) => setFormData({ ...formData, name: value })}
            />
            
            <TextField
              id="email"
              label="Email Address"
              type="email"
              value={formData.email}
              placeholder="Enter your email"
              onChange={(value) => setFormData({ ...formData, email: value })}
            />
            
            <TextField
              id="phone"
              label="Phone Number"
              value={formData.phone}
              placeholder="Enter your phone number"
              onChange={(value) => setFormData({ ...formData, phone: value })}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell us about yourself"
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-cosmic-purple focus:outline-none resize-none"
              />
            </div>
          </div>
        )

      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Security Settings</h3>
            
            <ToggleField
              id="twoFactor"
              label="Two-Factor Authentication"
              value={formData.twoFactor}
              help="Add an extra layer of security to your account"
              onChange={(value) => setFormData({ ...formData, twoFactor: value })}
            />
            
            <ToggleField
              id="loginAlerts"
              label="Login Alerts"
              value={formData.loginAlerts}
              help="Get notified of new sign-ins to your account"
              onChange={(value) => setFormData({ ...formData, loginAlerts: value })}
            />
            
            <SliderField
              id="sessionTimeout"
              label="Session Timeout (minutes)"
              value={formData.sessionTimeout}
              min={5}
              max={120}
              step={5}
              help="Automatically log out after inactivity"
              onChange={(value) => setFormData({ ...formData, sessionTimeout: value })}
            />
            
            <div className="pt-4 border-t border-dark-border">
              <h4 className="text-white font-medium mb-4">Change Password</h4>
              
              <div className="space-y-4">
                <TextField
                  id="currentPassword"
                  label="Current Password"
                  type="password"
                  value=""
                  placeholder="Enter current password"
                />
                
                <TextField
                  id="newPassword"
                  label="New Password"
                  type="password"
                  value=""
                  placeholder="Enter new password"
                />
                
                <TextField
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value=""
                  placeholder="Confirm new password"
                />
                
                <button className="px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
            
            <div className="space-y-4">
              <h4 className="text-white text-sm font-medium">Channels</h4>
              
              <ToggleField
                id="emailNotifications"
                label="Email Notifications"
                value={formData.emailNotifications}
                onChange={(value) => setFormData({ ...formData, emailNotifications: value })}
              />
              
              <ToggleField
                id="pushNotifications"
                label="Push Notifications"
                value={formData.pushNotifications}
                onChange={(value) => setFormData({ ...formData, pushNotifications: value })}
              />
              
              <ToggleField
                id="smsNotifications"
                label="SMS Notifications"
                value={formData.smsNotifications}
                onChange={(value) => setFormData({ ...formData, smsNotifications: value })}
              />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-dark-border">
              <h4 className="text-white text-sm font-medium">Alert Types</h4>
              
              <ToggleField
                id="orderAlerts"
                label="Order Alerts"
                value={formData.orderAlerts}
                help="Get notified about new orders"
                onChange={(value) => setFormData({ ...formData, orderAlerts: value })}
              />
              
              <ToggleField
                id="inventoryAlerts"
                label="Inventory Alerts"
                value={formData.inventoryAlerts}
                help="Get notified about low stock"
                onChange={(value) => setFormData({ ...formData, inventoryAlerts: value })}
              />
              
              <ToggleField
                id="marketingAlerts"
                label="Marketing Alerts"
                value={formData.marketingAlerts}
                help="Get notified about campaigns"
                onChange={(value) => setFormData({ ...formData, marketingAlerts: value })}
              />
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Appearance Settings</h3>
            
            <SelectField
              id="theme"
              label="Theme"
              value={formData.theme}
              options={[
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
                { label: 'System', value: 'system' }
              ]}
              onChange={(value) => setFormData({ ...formData, theme: value })}
            />
            
            <SelectField
              id="sidebarPosition"
              label="Sidebar Position"
              value={formData.sidebarPosition}
              options={[
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' }
              ]}
              onChange={(value) => setFormData({ ...formData, sidebarPosition: value })}
            />
            
            <ToggleField
              id="compactMode"
              label="Compact Mode"
              value={formData.compactMode}
              help="Show more content with reduced spacing"
              onChange={(value) => setFormData({ ...formData, compactMode: value })}
            />
            
            <SelectField
              id="fontSize"
              label="Font Size"
              value={formData.fontSize}
              options={[
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' }
              ]}
              onChange={(value) => setFormData({ ...formData, fontSize: value })}
            />
            
            <ColorField
              id="primaryColor"
              label="Primary Color"
              value={formData.primaryColor}
              help="Customize the accent color"
              onChange={(value) => setFormData({ ...formData, primaryColor: value })}
            />
          </div>
        )

      case 'store':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Store Settings</h3>
            
            <TextField
              id="storeName"
              label="Store Name"
              value={formData.storeName}
              onChange={(value) => setFormData({ ...formData, storeName: value })}
            />
            
            <TextField
              id="storeEmail"
              label="Store Email"
              type="email"
              value={formData.storeEmail}
              onChange={(value) => setFormData({ ...formData, storeEmail: value })}
            />
            
            <TextField
              id="storePhone"
              label="Store Phone"
              value={formData.storePhone}
              onChange={(value) => setFormData({ ...formData, storePhone: value })}
            />
            
            <SelectField
              id="currency"
              label="Currency"
              value={formData.currency}
              options={[
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'GBP (£)', value: 'GBP' }
              ]}
              onChange={(value) => setFormData({ ...formData, currency: value })}
            />
            
            <SelectField
              id="timezone"
              label="Timezone"
              value={formData.timezone}
              options={[
                { label: 'Eastern Time (ET)', value: 'America/New_York' },
                { label: 'Central Time (CT)', value: 'America/Chicago' },
                { label: 'Mountain Time (MT)', value: 'America/Denver' },
                { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' }
              ]}
              onChange={(value) => setFormData({ ...formData, timezone: value })}
            />
            
            <SelectField
              id="language"
              label="Language"
              value={formData.language}
              options={[
                { label: 'English', value: 'en' },
                { label: 'Spanish', value: 'es' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' }
              ]}
              onChange={(value) => setFormData({ ...formData, language: value })}
            />
          </div>
        )

      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Data Management</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="p-6 bg-dark-hover rounded-xl hover:bg-dark-card transition-colors text-center">
                <Download className="w-8 h-8 text-cosmic-purple mx-auto mb-3" />
                <p className="text-white font-medium">Export Data</p>
                <p className="text-xs text-gray-400 mt-2">CSV, Excel, PDF</p>
              </button>
              
              <button className="p-6 bg-dark-hover rounded-xl hover:bg-dark-card transition-colors text-center">
                <Upload className="w-8 h-8 text-cosmic-purple mx-auto mb-3" />
                <p className="text-white font-medium">Import Data</p>
                <p className="text-xs text-gray-400 mt-2">CSV, Excel</p>
              </button>
              
              <button className="p-6 bg-dark-hover rounded-xl hover:bg-dark-card transition-colors text-center">
                <RefreshCw className="w-8 h-8 text-cosmic-purple mx-auto mb-3" />
                <p className="text-white font-medium">Sync Now</p>
                <p className="text-xs text-gray-400 mt-2">Last sync: 2 min ago</p>
              </button>
              
              <button className="p-6 bg-dark-hover rounded-xl hover:bg-dark-card transition-colors text-center">
                <Database className="w-8 h-8 text-cosmic-purple mx-auto mb-3" />
                <p className="text-white font-medium">Backup</p>
                <p className="text-xs text-gray-400 mt-2">Last backup: Today</p>
              </button>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-dark-border">
              <h4 className="text-white font-medium">Backup Settings</h4>
              
              <ToggleField
                id="autoBackup"
                label="Automatic Backup"
                value={formData.autoBackup}
                onChange={(value) => setFormData({ ...formData, autoBackup: value })}
              />
              
              <SelectField
                id="backupFrequency"
                label="Backup Frequency"
                value={formData.backupFrequency}
                options={[
                  { label: 'Daily', value: 'daily' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' }
                ]}
                onChange={(value) => setFormData({ ...formData, backupFrequency: value })}
              />
              
              <SliderField
                id="dataRetention"
                label="Data Retention (days)"
                value={formData.dataRetention}
                min={30}
                max={365}
                step={30}
                help="How long to keep data before auto-deletion"
                onChange={(value) => setFormData({ ...formData, dataRetention: value })}
              />
            </div>
            
            <div className="pt-4 border-t border-dark-border">
              <h4 className="text-white font-medium mb-4 text-error-red">Danger Zone</h4>
              
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-error-red/10 text-error-red rounded-lg hover:bg-error-red/20 transition-colors"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg text-white mb-2">Select a setting</h3>
            <p className="text-gray-400">Choose a category from the left to configure your settings</p>
          </div>
        )
    }
  }

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-cosmic-purple" />
            Settings
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure your dashboard preferences
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 glass-card hover:bg-dark-hover rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-cosmic-purple text-white rounded-xl hover:bg-electric-blue transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-80 space-y-2">
          {SECTIONS.map((section) => (
            <SettingCard
              key={section.id}
              icon={section.icon}
              title={section.title}
              description={section.description}
              active={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 glass-card p-6">
          {renderSection()}
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative glass-card max-w-md w-full rounded-2xl p-6">
            <AlertCircle className="w-12 h-12 text-warning-orange mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white text-center mb-2">Reset Settings?</h3>
            <p className="text-gray-400 text-center mb-6">
              This will reset all settings to their default values. This action cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 px-4 py-2 bg-error-red text-white rounded-lg hover:bg-error-red/80 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
