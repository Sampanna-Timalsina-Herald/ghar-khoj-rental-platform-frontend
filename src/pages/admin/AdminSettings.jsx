import React, { useState } from 'react'
import { Settings, Bell, Lock, Globe, Database, Save, X, CheckCircle } from 'lucide-react'

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
    siteName: 'KhojGhar',
    siteDescription: 'Find your perfect home',
    maintenanceMode: false,
    enableNotifications: true,
    requireEmailVerification: true,
    enableTwoFactor: false,
    maxListingsPerUser: 10,
    listingApprovalRequired: true,
    autoRejectionDays: 30,
    maintenanceMessage: 'Site is under maintenance. Please try again later.',
  })

  const [saved, setSaved] = useState(false)

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    console.log('Saving settings:', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Manage platform configuration and preferences</p>
      </div>

      {/* Save Notification */}
      {saved && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <CheckCircle size={20} />
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}

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
            enabled={true}
            onChange={() => {}}
          />
          <ToggleSetting
            label="Message Notifications"
            description="Notify users when they receive new messages"
            enabled={true}
            onChange={() => {}}
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
            <p className="text-gray-600 text-sm mt-2">Maximum number of listings each user can create</p>
          </div>
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
        <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors font-medium flex items-center gap-2">
          <X size={20} />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
        >
          <Save size={20} />
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default AdminSettings
