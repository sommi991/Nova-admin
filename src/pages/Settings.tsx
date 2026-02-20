import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Bell, Shield,
  Palette, Download, Upload, RefreshCw, Save,
  AlertCircle, ShoppingBag, Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUserStore, useUIStore } from '../store/store';

// ============================================================================
// TYPES
// ============================================================================

interface SettingSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
}

// Simple field props - no complex types
interface FieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  help?: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
}

// ============================================================================
// SETTING SECTIONS
// ============================================================================

const SECTIONS: SettingSection[] = [
  { id: 'profile', title: 'Profile', icon: User, description: 'Manage your personal information' },
  { id: 'account', title: 'Account', icon: Shield, description: 'Security and account settings' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Configure how you receive alerts' },
  { id: 'appearance', title: 'Appearance', icon: Palette, description: 'Customize the look and feel' },
  { id: 'store', title: 'Store Settings', icon: ShoppingBag, description: 'Manage your e-commerce store' },
  { id: 'data', title: 'Data Management', icon: Database, description: 'Import, export, and backup data' }
];

// ============================================================================
// SETTING CARD COMPONENT
// ============================================================================

const SettingCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  active?: boolean;
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
      <div className={`p-3 rounded-xl ${active ? 'bg-cosmic-purple/30' : 'bg-dark-card'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-cosmic-purple' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1 text-left">
        <h3 className={`text-sm font-medium ${active ? 'text-cosmic-purple' : 'text-white'}`}>
          {title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
    </motion.button>
  );
};

// ============================================================================
// SIMPLE FIELD COMPONENTS
// ============================================================================

const TextField: React.FC<FieldProps> = ({ label, value, onChange, placeholder, help }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-cosmic-purple focus:outline-none"
    />
    {help && <p className="text-xs text-gray-500">{help}</p>}
  </div>
);

const ToggleField: React.FC<FieldProps> = ({ label, value, onChange, help }) => (
  <div className="flex items-center justify-between">
    <div>
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
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
);

const SelectField: React.FC<FieldProps> = ({ label, value, onChange, options, help }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
);

const SliderField: React.FC<FieldProps> = ({ label, value, onChange, min, max, step, help }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <span className="text-sm text-white">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer"
    />
    {help && <p className="text-xs text-gray-500">{help}</p>}
  </div>
);

const ColorField: React.FC<FieldProps> = ({ label, value, onChange, help }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <div className="flex items-center space-x-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
      />
    </div>
    {help && <p className="text-xs text-gray-500">{help}</p>}
  </div>
);

const ImageField: React.FC<FieldProps> = ({ label, value, onChange, help }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="flex items-center space-x-4">
        {value && (
          <img src={value} alt={label} className="w-16 h-16 rounded-lg object-cover" />
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
            className="inline-flex items-center px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card cursor-pointer"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </label>
        </div>
      </div>
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  );
};

// ============================================================================
// SETTINGS PAGE
// ============================================================================

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const userState = useUserStore();
  const uiState = useUIStore();

  // Form state
  const [formData, setFormData] = useState({
    name: userState.name || 'John Doe',
    email: userState.email || 'john@nova.com',
    phone: '+1 (555) 123-4567',
    bio: 'E-commerce manager with 5+ years of experience',
    avatar: userState.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: 30,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    inventoryAlerts: true,
    marketingAlerts: false,
    theme: uiState.theme,
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
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 90
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    userState.updateProfile({
      name: formData.name,
      email: formData.email,
      avatar: formData.avatar
    });
    
    uiState.setTheme(formData.theme as 'dark' | 'light');
    toast.success('Settings saved successfully!');
    setIsSaving(false);
  };

  const handleReset = () => setShowResetConfirm(true);

  const confirmReset = () => {
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
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 90
    });
    setShowResetConfirm(false);
    toast.success('Settings reset to defaults');
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Profile Information</h3>
            <ImageField
              label="Profile Picture"
              value={formData.avatar}
              onChange={(v) => updateField('avatar', v)}
              help="Recommended size: 256x256px"
            />
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={(v) => updateField('name', v)}
              placeholder="Enter your full name"
            />
            <TextField
              label="Email Address"
              value={formData.email}
              onChange={(v) => updateField('email', v)}
              placeholder="Enter your email"
            />
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={(v) => updateField('phone', v)}
              placeholder="Enter your phone number"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={4}
                placeholder="Tell us about yourself"
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-cosmic-purple focus:outline-none resize-none"
              />
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Security Settings</h3>
            <ToggleField
              label="Two-Factor Authentication"
              value={formData.twoFactor}
              onChange={(v) => updateField('twoFactor', v)}
              help="Add an extra layer of security to your account"
            />
            <ToggleField
              label="Login Alerts"
              value={formData.loginAlerts}
              onChange={(v) => updateField('loginAlerts', v)}
              help="Get notified of new sign-ins"
            />
            <SliderField
              label="Session Timeout (minutes)"
              value={formData.sessionTimeout}
              onChange={(v) => updateField('sessionTimeout', v)}
              min={5}
              max={120}
              step={5}
              help="Automatically log out after inactivity"
            />
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
            <ToggleField
              label="Email Notifications"
              value={formData.emailNotifications}
              onChange={(v) => updateField('emailNotifications', v)}
            />
            <ToggleField
              label="Push Notifications"
              value={formData.pushNotifications}
              onChange={(v) => updateField('pushNotifications', v)}
            />
            <ToggleField
              label="SMS Notifications"
              value={formData.smsNotifications}
              onChange={(v) => updateField('smsNotifications', v)}
            />
            <ToggleField
              label="Order Alerts"
              value={formData.orderAlerts}
              onChange={(v) => updateField('orderAlerts', v)}
              help="Get notified about new orders"
            />
            <ToggleField
              label="Inventory Alerts"
              value={formData.inventoryAlerts}
              onChange={(v) => updateField('inventoryAlerts', v)}
              help="Get notified about low stock"
            />
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Appearance Settings</h3>
            <SelectField
              label="Theme"
              value={formData.theme}
              onChange={(v) => updateField('theme', v)}
              options={[
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
                { label: 'System', value: 'system' }
              ]}
            />
            <SelectField
              label="Sidebar Position"
              value={formData.sidebarPosition}
              onChange={(v) => updateField('sidebarPosition', v)}
              options={[
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' }
              ]}
            />
            <ToggleField
              label="Compact Mode"
              value={formData.compactMode}
              onChange={(v) => updateField('compactMode', v)}
              help="Show more content with reduced spacing"
            />
            <SelectField
              label="Font Size"
              value={formData.fontSize}
              onChange={(v) => updateField('fontSize', v)}
              options={[
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' }
              ]}
            />
            <ColorField
              label="Primary Color"
              value={formData.primaryColor}
              onChange={(v) => updateField('primaryColor', v)}
              help="Customize the accent color"
            />
          </div>
        );

      case 'store':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Store Settings</h3>
            <TextField
              label="Store Name"
              value={formData.storeName}
              onChange={(v) => updateField('storeName', v)}
            />
            <TextField
              label="Store Email"
              value={formData.storeEmail}
              onChange={(v) => updateField('storeEmail', v)}
            />
            <TextField
              label="Store Phone"
              value={formData.storePhone}
              onChange={(v) => updateField('storePhone', v)}
            />
            <SelectField
              label="Currency"
              value={formData.currency}
              onChange={(v) => updateField('currency', v)}
              options={[
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'GBP (£)', value: 'GBP' }
              ]}
            />
            <SelectField
              label="Timezone"
              value={formData.timezone}
              onChange={(v) => updateField('timezone', v)}
              options={[
                { label: 'Eastern Time (ET)', value: 'America/New_York' },
                { label: 'Central Time (CT)', value: 'America/Chicago' },
                { label: 'Mountain Time (MT)', value: 'America/Denver' },
                { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' }
              ]}
            />
            <SelectField
              label="Language"
              value={formData.language}
              onChange={(v) => updateField('language', v)}
              options={[
                { label: 'English', value: 'en' },
                { label: 'Spanish', value: 'es' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' }
              ]}
            />
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Data Management</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-6 bg-dark-hover rounded-xl hover:bg-dark-card text-center">
                <Download className="w-8 h-8 text-cosmic-purple mx-auto mb-3" />
                <p className="text-white font-medium">Export Data</p>
                <p className="text-xs text-gray-400 mt-2">CSV, Excel, PDF</p>
              </button>
              <button className="p-6 bg-dark-hover rounded-xl hover:bg-dark-card text-center">
                <Upload className="w-8 h-8 text-cosmic-purple mx-auto mb-3" />
                <p className="text-white font-medium">Import Data</p>
                <p className="text-xs text-gray-400 mt-2">CSV, Excel</p>
              </button>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-dark-border">
              <h4 className="text-white font-medium">Backup Settings</h4>
              <ToggleField
                label="Automatic Backup"
                value={formData.autoBackup}
                onChange={(v) => updateField('autoBackup', v)}
              />
              <SelectField
                label="Backup Frequency"
                value={formData.backupFrequency}
                onChange={(v) => updateField('backupFrequency', v)}
                options={[
                  { label: 'Daily', value: 'daily' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' }
                ]}
              />
              <SliderField
                label="Data Retention (days)"
                value={formData.dataRetention}
                onChange={(v) => updateField('dataRetention', v)}
                min={30}
                max={365}
                step={30}
                help="How long to keep data before auto-deletion"
              />
            </div>
            
            <div className="pt-4 border-t border-dark-border">
              <h4 className="text-white font-medium mb-4 text-error-red">Danger Zone</h4>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-error-red/10 text-error-red rounded-lg hover:bg-error-red/20"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg text-white mb-2">Select a setting</h3>
            <p className="text-gray-400">Choose a category from the left to configure your settings</p>
          </div>
        );
    }
  };

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center">
            <SettingsIcon className="w-8 h-8 mr-3 text-cosmic-purple" />
            Settings
          </h1>
          <p className="text-gray-400 text-sm mt-1">Configure your dashboard preferences</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 glass-card hover:bg-dark-hover rounded-xl text-gray-400 hover:text-white"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-cosmic-purple text-white rounded-xl hover:bg-electric-blue disabled:opacity-50 flex items-center space-x-2"
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

        <div className="flex-1 glass-card p-6">
          {renderSection()}
        </div>
      </div>

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
                className="flex-1 px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 px-4 py-2 bg-error-red text-white rounded-lg hover:bg-error-red/80"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
