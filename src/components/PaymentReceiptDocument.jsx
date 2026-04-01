/**
 * Payment Receipt Document Component
 * Official receipt template for GharKhoj payments
 */

import React, { forwardRef } from 'react'
import gharkhojLogo from '../assets/GHARKHOJ_LOGO.png'

const PaymentReceiptDocument = forwardRef(({ payment, booking }, ref) => {
  if (!payment) return null

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-NP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const amount = Number(payment.amount || 0)
  const transactionId = payment.transaction_uuid || payment.gateway_transaction_id || 'N/A'
  const gateway = payment.gateway || 'N/A'
  const status = payment.status || 'pending'
  const paymentType = payment.payment_type || 'rent'
  const createdAt = payment.created_at ? new Date(payment.created_at) : new Date()

  // Get customer/payer info
  const payerName = payment.customer_name || booking?.tenant_name || 'N/A'
  const payerEmail = payment.customer_email || booking?.tenant_email || 'N/A'
  const payerPhone = payment.customer_phone || booking?.tenant_phone || 'N/A'

  // Get property info if available
  const propertyTitle = booking?.listing_title || payment.purchase_order_name || 'N/A'
  const propertyAddress = booking?.listing_address ? `${booking.listing_address}, ${booking.listing_city}` : 'N/A'

  return (
    <div ref={ref} className="bg-white p-8 max-w-xl mx-auto font-sans text-gray-900" style={{ fontSize: '10pt' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <img src={gharkhojLogo} alt="GharKhoj" className="h-14 mx-auto mb-2" />
        <h1 className="text-xl font-bold tracking-wide">PAYMENT RECEIPT</h1>
        <p className="text-xs text-gray-500 mt-1">Official Receipt from GHARKHOJ</p>
      </div>

      {/* Receipt Meta */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 text-xs">Receipt No.</span>
            <p className="font-mono font-bold">{transactionId.substring(0, 12).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <span className="text-gray-500 text-xs">Date & Time</span>
            <p className="font-semibold">{formatDate(createdAt)}</p>
            <p className="text-xs text-gray-500">{formatTime(createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Payment Status Banner */}
      <div className={`text-center py-3 rounded-lg mb-6 ${
        status === 'completed' ? 'bg-green-100 text-green-800' :
        status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        <span className="font-bold text-lg uppercase">
          {status === 'completed' ? '✓ PAYMENT SUCCESSFUL' :
           status === 'pending' ? '⏳ PAYMENT PENDING' :
           '✗ PAYMENT FAILED'}
        </span>
      </div>

      {/* Payer Information */}
      <section className="mb-6">
        <h2 className="text-sm font-bold text-gray-600 uppercase mb-3">Payer Information</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold">{payerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{payerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span>{payerPhone}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Details */}
      <section className="mb-6">
        <h2 className="text-sm font-bold text-gray-600 uppercase mb-3">Payment Details</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">Description</td>
                <td className="py-3 px-4 font-semibold text-right">{propertyTitle}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">Payment Type</td>
                <td className="py-3 px-4 font-semibold text-right capitalize">{paymentType.replace('_', ' ')}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">Payment Gateway</td>
                <td className="py-3 px-4 font-semibold text-right capitalize">{gateway}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">Transaction ID</td>
                <td className="py-3 px-4 font-mono text-xs text-right">{transactionId}</td>
              </tr>
              {propertyAddress !== 'N/A' && (
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-600">Property</td>
                  <td className="py-3 px-4 text-right text-xs">{propertyAddress}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Amount Section */}
      <section className="mb-6">
        <div className="bg-gray-900 text-white p-6 rounded-lg text-center">
          <p className="text-xs text-gray-400 uppercase mb-1">Amount Paid</p>
          <p className="text-3xl font-bold">NPR {amount.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">
            ({numberToWords(amount)} Nepali Rupees Only)
          </p>
        </div>
      </section>

      {/* Notes */}
      <section className="mb-6 text-xs text-gray-500">
        <p className="mb-1">• This is a computer-generated receipt and does not require a physical signature.</p>
        <p className="mb-1">• Please retain this receipt for your records.</p>
        <p>• For any queries, contact support@gharkhoj.com</p>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={gharkhojLogo} alt="GharKhoj" className="h-5" />
          <span className="font-bold text-gray-700">GHARKHOJ</span>
        </div>
        <p className="text-xs text-gray-500">Nepal's Trusted Property Rental Platform</p>
        <p className="text-xs text-gray-400 mt-1">www.gharkhoj.com | support@gharkhoj.com</p>
      </div>
    </div>
  )
})

// Helper function to convert number to words (simplified)
function numberToWords(num) {
  if (num === 0) return 'Zero'
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
                'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  
  const numString = (n) => {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + numString(n % 100) : '')
    if (n < 100000) return numString(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numString(n % 1000) : '')
    if (n < 10000000) return numString(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + numString(n % 100000) : '')
    return numString(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + numString(n % 10000000) : '')
  }
  
  return numString(Math.floor(num))
}

PaymentReceiptDocument.displayName = 'PaymentReceiptDocument'

export default PaymentReceiptDocument
