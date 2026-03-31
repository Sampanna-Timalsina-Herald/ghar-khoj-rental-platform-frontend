import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Wallet, Building2, Loader2, CheckCircle, Info } from 'lucide-react'
import { getPaymentSettings, updatePaymentSettings } from '../services/landlordService'

// Import payment logos
import khaltiLogo from '../assets/Khalti-logo.png'
import esewaLogo from '../assets/Esewa-logo.png'

const PaymentSettingsSection = ({ onSave }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    esewa_id: '',
    khalti_id: '',
    preferred_payment_method: 'khalti',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: ''
  })
  const [originalSettings, setOriginalSettings] = useState(null)

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await getPaymentSettings()
      if (response.success) {
        const fetchedSettings = {
          esewa_id: response.data.esewa_id || '',
          khalti_id: response.data.khalti_id || '',
          preferred_payment_method: response.data.preferred_payment_method || 'khalti',
          bank_name: response.data.bank_name || '',
          bank_account_name: response.data.bank_account_name || '',
          bank_account_number: response.data.bank_account_number || ''
        }
        setSettings(fetchedSettings)
        setOriginalSettings(fetchedSettings)
      }
    } catch (error) {
      console.error('Failed to fetch payment settings:', error)
      toast.error('Failed to load payment settings')
    } finally {
      setLoading(false)
    }
  }

  const validateNepalPhone = (phone) => {
    if (!phone) return true // Empty is valid (optional field)
    const phoneRegex = /^(97|98)\d{8}$/
    return phoneRegex.test(phone)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    // Validate phone numbers
    if (settings.esewa_id && !validateNepalPhone(settings.esewa_id)) {
      toast.error('Invalid eSewa ID. Must be 10 digits starting with 97 or 98')
      return
    }

    if (settings.khalti_id && !validateNepalPhone(settings.khalti_id)) {
      toast.error('Invalid Khalti ID. Must be 10 digits starting with 97 or 98')
      return
    }

    // Validate bank details if bank is selected
    if (settings.preferred_payment_method === 'bank') {
      if (!settings.bank_name || !settings.bank_account_name || !settings.bank_account_number) {
        toast.error('Please fill in all bank details')
        return
      }
    }

    try {
      setSaving(true)

      const response = await updatePaymentSettings(settings)

      if (response.success) {
        toast.success('Payment settings saved successfully!')
        setOriginalSettings(settings)
        if (onSave) onSave(response.data)
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save payment settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Wallet className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Payment Settings</h3>
            <p className="text-white/80 text-sm">Configure how you receive rent payments</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-medium">How it works</p>
            <p className="mt-1 text-blue-700">
              When tenants pay rent for your properties, the payment is tracked and associated with your account. 
              Set up your preferred payment method to receive payouts.
            </p>
          </div>
        </div>

        {/* Preferred Payment Method */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Preferred Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Khalti Option */}
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'preferred_payment_method', value: 'khalti' } })}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.preferred_payment_method === 'khalti'
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <img src={khaltiLogo} alt="Khalti" className="h-8 object-contain" />
                <span className="text-sm font-medium text-gray-700">Khalti</span>
                {settings.preferred_payment_method === 'khalti' && (
                  <CheckCircle className="text-purple-600" size={16} />
                )}
              </div>
            </button>

            {/* eSewa Option */}
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'preferred_payment_method', value: 'esewa' } })}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.preferred_payment_method === 'esewa'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <img src={esewaLogo} alt="eSewa" className="h-8 object-contain" />
                <span className="text-sm font-medium text-gray-700">eSewa</span>
                {settings.preferred_payment_method === 'esewa' && (
                  <CheckCircle className="text-green-600" size={16} />
                )}
              </div>
            </button>

            {/* Bank Option */}
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'preferred_payment_method', value: 'bank' } })}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.preferred_payment_method === 'bank'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Building2 className="text-gray-600" size={32} />
                <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
                {settings.preferred_payment_method === 'bank' && (
                  <CheckCircle className="text-blue-600" size={16} />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Wallet Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Khalti ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <img src={khaltiLogo} alt="Khalti" className="h-4" />
              Khalti Wallet Number
            </label>
            <input
              type="tel"
              name="khalti_id"
              value={settings.khalti_id}
              onChange={handleChange}
              placeholder="98XXXXXXXX"
              maxLength={10}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all ${
                settings.khalti_id && !validateNepalPhone(settings.khalti_id)
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
            />
            {settings.khalti_id && !validateNepalPhone(settings.khalti_id) && (
              <p className="text-xs text-red-500 mt-1">Must be 10 digits starting with 97 or 98</p>
            )}
          </div>

          {/* eSewa ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <img src={esewaLogo} alt="eSewa" className="h-4" />
              eSewa Wallet Number
            </label>
            <input
              type="tel"
              name="esewa_id"
              value={settings.esewa_id}
              onChange={handleChange}
              placeholder="98XXXXXXXX"
              maxLength={10}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all ${
                settings.esewa_id && !validateNepalPhone(settings.esewa_id)
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
            />
            {settings.esewa_id && !validateNepalPhone(settings.esewa_id) && (
              <p className="text-xs text-red-500 mt-1">Must be 10 digits starting with 97 or 98</p>
            )}
          </div>
        </div>

        {/* Bank Details (shown when bank is selected) */}
        {settings.preferred_payment_method === 'bank' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 pt-4 border-t border-gray-200"
          >
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              Bank Account Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={settings.bank_name}
                  onChange={handleChange}
                  placeholder="e.g., Nepal Bank Limited"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="bank_account_name"
                  value={settings.bank_account_name}
                  onChange={handleChange}
                  placeholder="As per bank records"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={settings.bank_account_number}
                  onChange={handleChange}
                  placeholder="Your bank account number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : !hasChanges ? (
              'No Changes'
            ) : (
              <>
                <CheckCircle size={20} />
                Save Payment Settings
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default PaymentSettingsSection
