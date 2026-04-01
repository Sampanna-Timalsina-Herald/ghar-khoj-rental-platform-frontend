/**
 * Rental Agreement Document Component
 * Formal rental agreement template for Nepal with GharKhoj branding
 */

import React, { forwardRef } from 'react'
import gharkhojLogo from '../assets/GHARKHOJ_LOGO.png'

const RentalAgreementDocument = forwardRef(({ agreement, booking, showSignatures = false }, ref) => {
  if (!agreement && !booking) return null

  // Support both agreement and booking data structures
  const data = agreement || booking
  
  const landlordName = data.landlord_name || data.landlord?.full_name || 'N/A'
  const landlordEmail = data.landlord_email || data.landlord?.email || 'N/A'
  const landlordPhone = data.landlord_phone || data.landlord?.phone || 'N/A'
  const tenantName = data.tenant_name || data.tenant?.full_name || 'N/A'
  const tenantEmail = data.tenant_email || data.tenant?.email || 'N/A'
  const tenantPhone = data.tenant_phone || data.tenant?.phone || 'N/A'
  
  const propertyTitle = data.listing_title || data.property_title || 'N/A'
  const propertyAddress = data.property_address || data.listing_address || 'N/A'
  const propertyCity = data.city || data.listing_city || 'N/A'
  const propertyType = data.property_type || 'Residential'
  
  const monthlyRent = Number(data.monthly_rent || 0)
  const securityDeposit = Number(data.deposit || data.security_deposit || 0)
  const startDate = data.start_date ? new Date(data.start_date) : new Date()
  const endDate = data.end_date ? new Date(data.end_date) : new Date()
  
  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30))
  const agreementId = data.id || data.agreement_id || 'PENDING'
  const createdAt = data.created_at ? new Date(data.created_at) : new Date()

  const formatDate = (date) => {
    return date.toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const terms = [
    'Tenant shall pay rent on or before the due date every month.',
    'Security deposit shall be refundable upon contract completion, subject to damage deductions.',
    'Tenant shall use the property only for residential purposes unless otherwise agreed.',
    'Tenant shall maintain cleanliness and minor repairs; major structural repairs are landlord\'s responsibility.',
    'Tenant shall not sublet or transfer the property without written consent of landlord.',
    'Landlord may inspect the property with at least 24-hour prior notice.',
    'Tenant shall comply with all local laws, municipality rules, and community regulations.',
    'Utilities (electricity, water, internet, garbage) shall be paid by the Tenant unless otherwise specified.',
    'Either party may terminate this agreement with 30 days prior written notice.',
    'Early termination by tenant may result in forfeiture of security deposit.',
    'Any illegal activity conducted by tenant will result in immediate termination.',
    'Property must be returned in original condition (normal wear and tear accepted).'
  ]

  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto font-serif text-gray-900" style={{ fontSize: '11pt' }}>
      {/* Header with Logo */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <img src={gharkhojLogo} alt="GharKhoj" className="h-16 mx-auto mb-3" />
        <h1 className="text-2xl font-bold tracking-wide">GHARKHOJ RENTAL AGREEMENT</h1>
        <p className="text-sm text-gray-600 mt-1">Nepal's Trusted Property Rental Platform</p>
      </div>

      {/* Agreement Meta */}
      <div className="flex justify-between text-sm mb-6 bg-gray-50 p-4 rounded">
        <div>
          <span className="text-gray-600">Agreement ID:</span>
          <span className="font-semibold ml-2">{String(agreementId).substring(0, 8).toUpperCase()}</span>
        </div>
        <div>
          <span className="text-gray-600">Date:</span>
          <span className="font-semibold ml-2">{formatDate(createdAt)}</span>
        </div>
      </div>

      <p className="mb-6 text-sm leading-relaxed">
        This Rental Agreement is made and entered into on <strong>{formatDate(createdAt)}</strong>, 
        by and between the parties identified below, in accordance with the laws of Nepal.
      </p>

      {/* Section 1: Parties */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">1. PARTIES</h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Landlord */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-bold text-blue-800 mb-3">LANDLORD (First Party)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-gray-600 w-20">Name:</span>
                <span className="font-semibold">{landlordName}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-20">Phone:</span>
                <span>{landlordPhone}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-20">Email:</span>
                <span>{landlordEmail}</span>
              </div>
            </div>
          </div>

          {/* Tenant */}
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-bold text-green-800 mb-3">TENANT (Second Party)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="text-gray-600 w-20">Name:</span>
                <span className="font-semibold">{tenantName}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-20">Phone:</span>
                <span>{tenantPhone}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-20">Email:</span>
                <span>{tenantEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Property Details */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">2. PROPERTY DETAILS</h2>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Property Type:</span>
              <span className="font-semibold ml-2">{propertyType}</span>
            </div>
            <div>
              <span className="text-gray-600">Property Name:</span>
              <span className="font-semibold ml-2">{propertyTitle}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Property Address:</span>
              <span className="font-semibold ml-2">{propertyAddress}, {propertyCity}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Financial Terms */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">3. FINANCIAL TERMS</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 p-4 rounded text-center">
            <p className="text-xs text-gray-600 uppercase">Monthly Rent</p>
            <p className="text-xl font-bold text-amber-700">NPR {monthlyRent.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded text-center">
            <p className="text-xs text-gray-600 uppercase">Security Deposit</p>
            <p className="text-xl font-bold text-red-700">NPR {securityDeposit.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded text-center">
            <p className="text-xs text-gray-600 uppercase">Total First Payment</p>
            <p className="text-xl font-bold text-purple-700">NPR {(monthlyRent + securityDeposit).toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Payment Method:</strong> eSewa / Khalti / Bank Transfer</p>
          <p><strong>Due Date:</strong> 1st of every month</p>
          <p><strong>Late Fee:</strong> NPR 500 after 7 days delay</p>
        </div>
      </section>

      {/* Section 4: Lease Period */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">4. LEASE PERIOD</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-xs text-gray-600 uppercase">Start Date</p>
            <p className="text-lg font-bold text-blue-700">{formatDate(startDate)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-xs text-gray-600 uppercase">End Date</p>
            <p className="text-lg font-bold text-green-700">{formatDate(endDate)}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-xs text-gray-600 uppercase">Duration</p>
            <p className="text-lg font-bold text-gray-700">{duration} Months</p>
          </div>
        </div>
      </section>

      {/* Section 5: Terms & Conditions */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">5. TERMS & CONDITIONS</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          {terms.map((term, index) => (
            <li key={index} className="leading-relaxed">{term}</li>
          ))}
        </ol>
      </section>

      {/* Section 6: Legal Compliance */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">6. LEGAL COMPLIANCE</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>This agreement is governed by the laws of Nepal, including the Muluki Civil Code 2074.</li>
          <li>Any disputes arising shall be resolved through mutual understanding or at the concerned District Court of Nepal.</li>
          <li>This agreement is legally binding upon digital or physical signature of both parties.</li>
        </ul>
      </section>

      {/* Section 7: Signatures */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">7. SIGNATURES</h2>
        <div className="grid grid-cols-2 gap-8 mt-6">
          {/* Tenant Signature */}
          <div className="border border-gray-300 p-4 rounded">
            <h3 className="font-bold text-gray-700 mb-4">Tenant (Second Party)</h3>
            <div className="h-20 border-b border-dashed border-gray-400 mb-4 flex items-end justify-center">
              {showSignatures && data.tenant_signature ? (
                <img src={data.tenant_signature} alt="Tenant Signature" className="max-h-16" />
              ) : (
                <span className="text-gray-400 text-sm pb-2">Signature</span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Name:</span> {tenantName}</p>
              <p><span className="text-gray-600">Date:</span> {showSignatures && data.tenant_signed_at ? formatDate(new Date(data.tenant_signed_at)) : '_______________'}</p>
            </div>
          </div>

          {/* Landlord Signature */}
          <div className="border border-gray-300 p-4 rounded">
            <h3 className="font-bold text-gray-700 mb-4">Landlord (First Party)</h3>
            <div className="h-20 border-b border-dashed border-gray-400 mb-4 flex items-end justify-center">
              {showSignatures && data.landlord_signature ? (
                <img src={data.landlord_signature} alt="Landlord Signature" className="max-h-16" />
              ) : (
                <span className="text-gray-400 text-sm pb-2">Signature</span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Name:</span> {landlordName}</p>
              <p><span className="text-gray-600">Date:</span> {showSignatures && data.landlord_signed_at ? formatDate(new Date(data.landlord_signed_at)) : '_______________'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t-2 border-gray-800 pt-4 mt-8 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={gharkhojLogo} alt="GharKhoj" className="h-6" />
          <span className="font-semibold text-gray-700">GHARKHOJ</span>
        </div>
        <p>Nepal's Trusted Property Rental Platform</p>
        <p>Email: support@gharkhoj.com | Website: www.gharkhoj.com</p>
        <p className="mt-2 text-gray-400">This document was generated digitally via GHARKHOJ platform on {formatDate(new Date())}</p>
      </div>
    </div>
  )
})

RentalAgreementDocument.displayName = 'RentalAgreementDocument'

export default RentalAgreementDocument
