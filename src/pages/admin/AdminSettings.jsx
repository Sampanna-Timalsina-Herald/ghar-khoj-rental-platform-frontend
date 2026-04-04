import React, { useState, useEffect } from 'react'
import { Settings, Bell, Lock, Globe, Database, Save, X, RefreshCw, AlertCircle, DollarSign } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'sonner'

const SettingSection = ({ icon, title, description, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 bg-blue-100 rounded-lg text-blue-600 mt-1">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
    </div>
    {children}
  </div>
)

const ToggleSetting = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between py-4 border-t border-gray-100 first:border-t-0">
    <div>
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
)

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'GharKhoj',
    siteDescription: 'Find your perfect home in Nepal',
    maintenanceMode: false,
    enableNotifications: true,
    requireEmailVerification: true,
    enableTwoFactor: false,
    maxListingsPerUser: 10,
    listingApprovalRequired: true,
    autoRejectionDays: 30,
    maintenanceMessage: 'Site is under maintenance. Please try again later.',
    enableNewListingAlerts: true,
    enableMessageNotifications: true,
    // Commission settings
    commission_enabled: false,
    commission_rate: 7,
    commission_minimum: 500,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [originalSettings, setOriginalSettings] = useState({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      
      const response = await api.get('/admin/settings')
      
      if (response.data.success) {
        // Backend returns simple object format: { settingKey: value }
        // Controller already handles type conversion
        const settingsData = response.data.data
        setSettings(settingsData)
        setOriginalSettings(settingsData)
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      toast.error('Failed to load settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await api.put('/admin/settings', settings)
      
      if (response.data.success) {
        toast.success('Settings saved successfully!')
        setOriginalSettings(settings)
      }
    } catch (err) {
      console.error('Error saving settings:', err)
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setSettings(originalSettings)
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Manage platform configuration and preferences</p>
        </div>
        <button
          onClick={fetchSettings}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Basic Settings */}
      <SettingSection
        icon={<Globe size={24} />}
        title="Basic Settings"
        description="Configure your platform's basic information"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleSettingChange('siteName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              rows="4"
            />
          </div>
        </div>
      </SettingSection>

      {/* Notification Settings */}
      <SettingSection
        icon={<Bell size={24} />}
        title="Notifications"
        description="Control how users receive notifications"
      >
        <div>
          <ToggleSetting
            label="Enable Notifications"
            description="Allow users to receive email and push notifications"
            enabled={settings.enableNotifications}
            onChange={(value) => handleSettingChange('enableNotifications', value)}
          />
          <ToggleSetting
            label="New Listing Alerts"
            description="Send alerts when new listings matching user preferences are posted"
            enabled={settings.enableNewListingAlerts}
            onChange={(value) => handleSettingChange('enableNewListingAlerts', value)}
          />
          <ToggleSetting
            label="Message Notifications"
            description="Notify users when they receive new messages"
            enabled={settings.enableMessageNotifications}
            onChange={(value) => handleSettingChange('enableMessageNotifications', value)}
          />
        </div>
      </SettingSection>

      {/* Security Settings */}
      <SettingSection
        icon={<Lock size={24} />}
        title="Security & Authentication"
        description="Manage user security and verification requirements"
      >
        <div>
          <ToggleSetting
            label="Require Email Verification"
            description="Users must verify their email before accessing the platform"
            enabled={settings.requireEmailVerification}
            onChange={(value) => handleSettingChange('requireEmailVerification', value)}
          />
          <ToggleSetting
            label="Enable Two-Factor Authentication"
            description="Allow users to enable 2FA for additional security"
            enabled={settings.enableTwoFactor}
            onChange={(value) => handleSettingChange('enableTwoFactor', value)}
          />
          <ToggleSetting
            label="Listing Approval Required"
            description="Admin must approve listings before they become public"
            enabled={settings.listingApprovalRequired}
            onChange={(value) => handleSettingChange('listingApprovalRequired', value)}
          />
          <div className="py-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-900 mb-2">Auto-Rejection Period (Days)</label>
            <input
              type="number"
              value={settings.autoRejectionDays}
              onChange={(e) => handleSettingChange('autoRejectionDays', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-gray-600 text-sm mt-2">Automatically reject unapproved listings after this many days</p>
          </div>
        </div>
      </SettingSection>

      {/* Listing Settings */}
      <SettingSection
        icon={<Database size={24} />}
        title="Listing Configuration"
        description="Control listing-related settings"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Max Listings Per User</label>
            <input
              type="number"
              value={settings.maxListingsPerUser}
              onChange={(e) => handleSettingChange('maxListingsPerUser', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-gray-600 text-sm mt-2">Maximum number of active listings each user can create</p>
          </div>
        </div>
      </SettingSection>

      {/* Commission Settings */}
      <SettingSection
        icon={<DollarSign size={24} />}
        title="Commission Settings"
        description="Control platform commission system for landlords"
      >
        <div>
          <ToggleSetting
            label="Enable Commission System"
            description="Charge landlords a commission on rental bookings. When disabled, no commission will be charged for new rentals."
            enabled={settings.commission_enabled}
            onChange={(value) => handleSettingChange('commission_enabled', value)}
          />
          <div className="py-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-900 mb-2">Commission Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.commission_rate || 7}
              onChange={(e) => handleSettingChange('commission_rate', parseFloat(e.target.value) || 0)}
              disabled={!settings.commission_enabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-gray-600 text-sm mt-2">Percentage of total rent charged as commission</p>
          </div>
          <div className="py-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-900 mb-2">Minimum Commission (Rs.)</label>
            <input
              type="number"
              min="0"
              value={settings.commission_minimum || 500}
              onChange={(e) => handleSettingChange('commission_minimum', parseFloat(e.target.value) || 0)}
              disabled={!settings.commission_enabled}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-gray-600 text-sm mt-2">Minimum commission amount per rental transaction</p>
          </div>
          {!settings.commission_enabled && (
            <div className="py-4 border-t border-gray-100 bg-yellow-50 -mx-6 px-6 -mb-6 rounded-b-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-yellow-800">Commission Disabled</p>
                  <p className="text-sm text-yellow-700">
                    No commission will be charged for properties rented while this setting is disabled. 
                    Previously created commission transactions will remain unchanged.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingSection>

      {/* Maintenance Mode */}
      <SettingSection
        icon={<Settings size={24} />}
        title="Maintenance Mode"
        description="Temporarily take the site offline for maintenance"
      >
        <div>
          <ToggleSetting
            label="Maintenance Mode"
            description="Disable user access and show maintenance message"
            enabled={settings.maintenanceMode}
            onChange={(value) => handleSettingChange('maintenanceMode', value)}
          />
          <div className="py-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-900 mb-2">Maintenance Message</label>
            <textarea
              value={settings.maintenanceMessage}
              onChange={(e) => handleSettingChange('maintenanceMessage', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              rows="3"
              disabled={!settings.maintenanceMode}
            />
          </div>
        </div>
      </SettingSection>

      {/* Save Button */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={handleCancel}
          disabled={!hasChanges}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={20} />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default AdminSettings
