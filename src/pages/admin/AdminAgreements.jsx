import React, { useState, useEffect } from 'react';
import {
  FileText, Eye, Download, Search, Filter, Users, Home, Calendar,
  CheckCircle, Clock, XCircle, AlertCircle, ChevronDown, ChevronUp,
  Mail, Phone, MapPin, CreditCard, User, Shield, FileCheck
} from 'lucide-react';
import api from '../../api/axios';

const AdminAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAgreements();
    fetchStats();
  }, [statusFilter]);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      
      console.log('[AdminAgreements] Fetching agreements with params:', params);
      const response = await api.get('/admin/agreements', { params });
      console.log('[AdminAgreements] Response:', response.data);
      
      if (response.data.success) {
        console.log('[AdminAgreements] Setting agreements:', response.data.data);
        setAgreements(response.data.data || []);
      } else {
        console.error('[AdminAgreements] API returned success: false');
        setError('Failed to fetch agreements');
      }
    } catch (error) {
      console.error('[AdminAgreements] Error fetching agreements:', error);
      console.error('[AdminAgreements] Error response:', error.response);
      setError(error.response?.data?.error || error.message || 'Failed to fetch agreements');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('[AdminAgreements] Fetching stats');
      const response = await api.get('/admin/agreements-stats');
      console.log('[AdminAgreements] Stats response:', response.data);
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        console.error('[AdminAgreements] Stats API returned success: false');
      }
    } catch (error) {
      console.error('[AdminAgreements] Error fetching stats:', error);
      console.error('[AdminAgreements] Error response:', error.response);
    }
  };

  const fetchAgreementDetails = async (id) => {
    try {
      const response = await api.get(`/admin/agreements/${id}`);
      
      if (response.data.success) {
        setSelectedAgreement(response.data.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error fetching agreement details:', error);
    }
  };

  const downloadPDF = async (agreementId) => {
    try {
      const response = await api.post(
        `/rent-agreements/${agreementId}/generate-pdf`,
        {},
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Agreement_${agreementId.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Pending' },
      for_review: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'For Review' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Pending Approval' },
      approved: { color: 'bg-teal-100 text-teal-800', icon: CheckCircle, label: 'Approved' },
      accepted: { color: 'bg-indigo-100 text-indigo-800', icon: CheckCircle, label: 'Accepted' },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
      completed: { color: 'bg-purple-100 text-purple-800', icon: FileCheck, label: 'Completed' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const filteredAgreements = agreements.filter(agreement => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      agreement.tenant?.name?.toLowerCase().includes(term) ||
      agreement.landlord?.name?.toLowerCase().includes(term) ||
      agreement.property?.title?.toLowerCase().includes(term) ||
      agreement.property?.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            Rental Agreements
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage all rental agreements</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <StatCard title="Total" value={stats.total_count || 0} icon={FileText} color="gray" />
            <StatCard title="Pending Approval" value={stats.pending_approval_count || 0} icon={AlertCircle} color="yellow" />
            <StatCard title="Active" value={stats.active_count || 0} icon={CheckCircle} color="green" />
            <StatCard title="Completed" value={stats.completed_count || 0} icon={FileCheck} color="purple" />
            <StatCard title="Pending" value={stats.pending_count || 0} icon={Clock} color="gray" />
            <StatCard 
              title="Active Rent" 
              value={`Rs. ${Number(stats.total_active_rent || 0).toLocaleString()}`} 
              icon={CreditCard} 
              color="indigo" 
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by tenant, landlord, property..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="for_review">For Review</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="accepted">Accepted</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agreements Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-300" />
              <p className="font-medium">Error loading agreements</p>
              <p className="text-sm text-red-400 mt-1">{error}</p>
              <button 
                onClick={fetchAgreements}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredAgreements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No agreements found</p>
              <p className="text-sm mt-1">Agreements will appear here when tenants create rent requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Landlord</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rent</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAgreements.map((agreement) => (
                    <tr key={agreement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[200px]">
                              {agreement.property?.title || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {agreement.property?.city || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{agreement.tenant?.name}</p>
                          <p className="text-sm text-gray-500">{agreement.tenant?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{agreement.landlord?.name}</p>
                          <p className="text-sm text-gray-500">{agreement.landlord?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {new Date(agreement.start_date).toLocaleDateString('en-GB')}
                          </p>
                          <p className="text-gray-500">
                            to {new Date(agreement.end_date).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          Rs. {Number(agreement.monthly_rent || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(agreement.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fetchAgreementDetails(agreement.id)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadPDF(agreement.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Agreement Details Modal */}
        {showDetails && selectedAgreement && (
          <AgreementDetailsModal
            agreement={selectedAgreement}
            onClose={() => {
              setShowDetails(false);
              setSelectedAgreement(null);
            }}
            onDownloadPDF={() => downloadPDF(selectedAgreement.id)}
          />
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    gray: 'bg-gray-50 text-gray-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Agreement Details Modal Component
const AgreementDetailsModal = ({ agreement, onClose, onDownloadPDF }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Agreement Details</h2>
              <p className="text-indigo-200 text-sm">ID: {agreement.id?.slice(0, 8)}...</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {['overview', 'tenant', 'landlord', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Property Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Home className="w-5 h-5 text-indigo-600" />
                  Property Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Title" value={agreement.property?.title} />
                  <InfoRow label="Type" value={agreement.property?.property_type} />
                  <InfoRow label="Address" value={agreement.property?.address} />
                  <InfoRow label="City" value={agreement.property?.city} />
                </div>
              </div>

              {/* Agreement Terms */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Agreement Terms
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Monthly Rent" value={`Rs. ${Number(agreement.monthly_rent || 0).toLocaleString()}`} />
                  <InfoRow label="Deposit" value={`Rs. ${Number(agreement.deposit || 0).toLocaleString()}`} />
                  <InfoRow label="Start Date" value={new Date(agreement.start_date).toLocaleDateString('en-GB')} />
                  <InfoRow label="End Date" value={new Date(agreement.end_date).toLocaleDateString('en-GB')} />
                  <InfoRow label="Status" value={agreement.status?.toUpperCase()} />
                  <InfoRow label="Created" value={new Date(agreement.created_at).toLocaleDateString('en-GB')} />
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Approval Timeline
                </h3>
                <div className="space-y-3">
                  <TimelineItem
                    label="Tenant Approved"
                    date={agreement.tenant_approved_at}
                    completed={!!agreement.tenant_approved_at}
                  />
                  <TimelineItem
                    label="Landlord Approved"
                    date={agreement.landlord_approved_at}
                    completed={!!agreement.landlord_approved_at}
                  />
                  <TimelineItem
                    label="Admin Confirmed"
                    date={agreement.admin_approved_at}
                    completed={!!agreement.admin_approved_at}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tenant' && (
            <UserDetails user={agreement.tenant} title="Tenant Information" />
          )}

          {activeTab === 'landlord' && (
            <UserDetails user={agreement.landlord} title="Landlord Information" />
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Signatures */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Digital Signatures
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <SignatureDisplay
                    label="Tenant Signature"
                    signature={agreement.signatures?.tenant_signature}
                    signedAt={agreement.signatures?.tenant_signed_at}
                    name={agreement.tenant?.name}
                  />
                  <SignatureDisplay
                    label="Landlord Signature"
                    signature={agreement.signatures?.landlord_signature}
                    signedAt={agreement.signatures?.landlord_signed_at}
                    name={agreement.landlord?.name}
                  />
                </div>
              </div>

              {/* Identity Documents */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-600" />
                  Identity Documents
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <DocumentCard
                    title="Tenant Documents"
                    citizenship={agreement.tenant?.documents?.citizenship_number}
                    district={agreement.tenant?.documents?.citizenship_district}
                    photo={agreement.tenant?.documents?.profile_image}
                    name={agreement.tenant?.name}
                  />
                  <DocumentCard
                    title="Landlord Documents"
                    citizenship={agreement.landlord?.documents?.citizenship_number}
                    district={agreement.landlord?.documents?.citizenship_district}
                    photo={agreement.landlord?.documents?.profile_image}
                    name={agreement.landlord?.name}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onDownloadPDF}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-900">{value || 'N/A'}</p>
  </div>
);

const TimelineItem = ({ label, date, completed }) => (
  <div className="flex items-center gap-3">
    <div className={`w-3 h-3 rounded-full ${completed ? 'bg-green-500' : 'bg-gray-300'}`} />
    <span className="text-gray-700">{label}</span>
    <span className="text-sm text-gray-500 ml-auto">
      {date ? new Date(date).toLocaleDateString('en-GB') : 'Pending'}
    </span>
  </div>
);

const UserDetails = ({ user, title }) => (
  <div className="space-y-6">
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-600" />
        {title}
      </h3>
      <div className="flex items-start gap-6">
        {user?.documents?.profile_image ? (
          <img
            src={user.documents.profile_image}
            alt={user?.name}
            className="w-24 h-24 rounded-xl object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-indigo-100 flex items-center justify-center">
            <User className="w-10 h-10 text-indigo-600" />
          </div>
        )}
        <div className="flex-1 grid grid-cols-2 gap-4">
          <InfoRow label="Name" value={user?.name} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Phone" value={user?.phone} />
          <InfoRow label="Registered" value={user?.registered_at ? new Date(user.registered_at).toLocaleDateString('en-GB') : 'N/A'} />
          <InfoRow label="Citizenship No." value={user?.documents?.citizenship_number} />
          <InfoRow label="Issued District" value={user?.documents?.citizenship_district} />
        </div>
      </div>
    </div>
  </div>
);

const SignatureDisplay = ({ label, signature, signedAt, name }) => (
  <div className="text-center">
    <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
    <div className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
      {signature ? (
        <img src={signature} alt={`${name}'s signature`} className="max-h-16 max-w-full" />
      ) : (
        <span className="text-gray-400 text-sm">Not signed</span>
      )}
    </div>
    <p className="text-xs text-gray-500 mt-1">{name}</p>
    {signedAt && (
      <p className="text-xs text-gray-400">
        {new Date(signedAt).toLocaleDateString('en-GB')}
      </p>
    )}
  </div>
);

const DocumentCard = ({ title, citizenship, district, photo, name }) => (
  <div className="border border-gray-200 rounded-xl p-4 bg-white">
    <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
    <div className="flex items-start gap-4">
      {photo ? (
        <img src={photo} alt={name} className="w-16 h-16 rounded-lg object-cover" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
          <User className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-gray-500">Citizenship Number</p>
        <p className="font-medium text-gray-900">{citizenship || 'Not provided'}</p>
        <p className="text-sm text-gray-500 mt-2">Issued District</p>
        <p className="font-medium text-gray-900">{district || 'Not provided'}</p>
      </div>
    </div>
  </div>
);

export default AdminAgreements;
