import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, CreditCard, FileSignature, Home, Loader2, Shield } from 'lucide-react'
import api from '../../api/axios'
import { processEsewaPayment, processKhaltiPayment } from '../../services/paymentService'
import SignaturePad from '../../components/SignaturePad'
import khaltiLogo from '../../assets/Khalti-logo.png'
import esewaLogo from '../../assets/Esewa-logo.png'
import { toast } from 'sonner'

const TenantRentAcceptance = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState({ is_paid: false })
  const [tenantSignature, setTenantSignature] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bookingResponse, paymentResponse] = await Promise.all([
        api.get(`/bookings/${bookingId}`),
        api.get(`/bookings/${bookingId}/first-payment-status`)
      ])

      setBooking(bookingResponse.data?.data || null)
      setPaymentStatus(paymentResponse.data?.data || { is_paid: false })
      
      // Check if payment was just completed
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('payment_success') === 'true' && paymentResponse.data?.data?.is_paid) {
        toast.success('Payment completed successfully! You can now sign the agreement below.')
        // Remove the query parameter
        window.history.replaceState({}, '', window.location.pathname)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load rent acceptance details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [bookingId])

  const firstPaymentAmount = useMemo(() => {
    if (!booking) return 0
    return Number(booking.monthly_rent || 0) + Number(booking.security_deposit || 0)
  }, [booking])

  const handlePay = async (gateway) => {
    if (!booking) return
    try {
      setIsProcessing(true)
      setError('')

      const payload = {
        payment_type: 'commission',
        reference_id: booking.id,
        amount: firstPaymentAmount,
        purchase_order_name: `First Rent Payment - ${booking.listing_title || 'Property'}`,
        purpose: 'rent',
        booking_id: booking.id,
        payment_mode: 'first',
        landlord_id: booking.landlord_id, // Track which landlord should receive this payment
        customer_info: {
          name: booking.tenant_name || 'Tenant',
          email: booking.tenant_email || 'tenant@example.com',
          phone: booking.tenant_phone || '9800000000'
        }
      }

      if (gateway === 'khalti') {
        await processKhaltiPayment(payload)
      } else {
        await processEsewaPayment(payload)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Payment initiation failed')
      setIsProcessing(false)
    }
  }

  const handleAcceptAgreement = async () => {
    if (!tenantSignature) {
      toast.error('Please draw your signature to continue')
      return
    }

    try {
      setIsProcessing(true)
      
      await api.put(`/bookings/${bookingId}/accept-agreement`, {
        tenant_signature: tenantSignature
      })

      toast.success('Agreement accepted successfully with your digital signature! The landlord will now verify and start the rent.')
      await fetchData()
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept agreement')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <Loader2 className="animate-spin text-primary-600" size={30} />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        Booking not found.
      </div>
    )
  }

  const paymentDone = !!paymentStatus.is_paid
  const tenantAccepted = booking.status === 'tenant_accepted' || booking.status === 'active'
  const rentStarted = booking.status === 'active'

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <button
        onClick={() => navigate('/tenant/agreements')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft size={16} /> Back to Agreements
      </button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rent Acceptance Flow</h1>
        <p className="text-gray-600 text-sm">Pay first, sign digitally, then landlord verifies to start rent.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Home size={18} /> Property Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Property</p>
                <p className="font-semibold text-gray-900">{booking.listing_title}</p>
              </div>
              <div>
                <p className="text-gray-500">Address</p>
                <p className="font-semibold text-gray-900">{booking.listing_address}, {booking.listing_city}</p>
              </div>
              <div>
                <p className="text-gray-500">Start Date</p>
                <p className="font-semibold text-gray-900">{new Date(booking.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">End Date</p>
                <p className="font-semibold text-gray-900">{new Date(booking.end_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Monthly Rent</p>
                <p className="font-semibold text-gray-900">Rs. {Number(booking.monthly_rent || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Security Deposit</p>
                <p className="font-semibold text-gray-900">Rs. {Number(booking.security_deposit || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} /> First Payment
            </h2>
            <p className="text-sm text-gray-600 mb-3">Tenant must pay first amount before accepting agreement.</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Amount to pay now (Rent + Deposit)</p>
              <p className="text-2xl font-bold text-gray-900">Rs. {Number(firstPaymentAmount).toLocaleString()}</p>
            </div>

            {paymentDone ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> Payment completed (Txn: {paymentStatus.transaction_uuid || 'Verified'})
              </div>
            ) : (
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handlePay('khalti')}
                  disabled={isProcessing || tenantAccepted || rentStarted}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <img src={khaltiLogo} alt="Khalti" className="w-5 h-5 rounded" />
                  Pay with Khalti
                </button>
                <button
                  onClick={() => handlePay('esewa')}
                  disabled={isProcessing || tenantAccepted || rentStarted}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <img src={esewaLogo} alt="eSewa" className="w-5 h-5 rounded" />
                  Pay with eSewa
                </button>
                <button
                  onClick={fetchData}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Refresh Payment Status
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileSignature size={18} /> Tenant Digital Signature & Acceptance
            </h2>
            
            {tenantAccepted || rentStarted ? (
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 text-green-800 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-2">Agreement Accepted ✓</p>
                    <p className="mb-2">You have successfully accepted the agreement with your digital signature.</p>
                    {rentStarted ? (
                      <p className="font-semibold text-green-900">🎉 Rental is now ACTIVE! You can start moving in.</p>
                    ) : (
                      <p>⏳ Waiting for landlord to verify and start the rent. You will be notified once approved.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Draw your signature below. The white background will be automatically removed.
                </p>
                
                <SignaturePad
                  onSignatureChange={setTenantSignature}
                  disabled={tenantAccepted || rentStarted}
                  existingSignature={booking.tenant_signature}
                />

                <div className="mt-4">
                  <button
                    onClick={handleAcceptAgreement}
                    disabled={isProcessing || !paymentDone || !tenantSignature || tenantAccepted || rentStarted}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Accept Agreement with Signature'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={16} /> Flow Tracker
            </h3>

            <ul className="space-y-3 text-sm">
              <li className={`flex items-center gap-2 ${paymentDone ? 'text-green-700' : 'text-gray-600'}`}>
                <CheckCircle size={15} /> Tenant first payment completed
              </li>
              <li className={`flex items-center gap-2 ${tenantAccepted ? 'text-green-700' : 'text-gray-600'}`}>
                <CheckCircle size={15} /> Tenant agreement accepted with signature
              </li>
              <li className={`flex items-center gap-2 ${rentStarted ? 'text-green-700' : 'text-gray-600'}`}>
                <CheckCircle size={15} /> Landlord verified and rent started
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Current Booking Status</p>
            <p className="capitalize">{booking.status.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TenantRentAcceptance
