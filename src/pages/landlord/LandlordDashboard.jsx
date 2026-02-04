import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { 
  Home, Calendar, User, Clock, Filter, 
  CheckCircle, XCircle, AlertCircle, Loader2,
  Eye, MapPin, DollarSign, Bed, Bath
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, available, rented, pending
  const [viewMode, setViewMode] = useState('card'); // card or table

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [filter, listings]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/listings/landlord/my-listings');
      if (response.data.success) {
        setListings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    if (filter === 'all') {
      setFilteredListings(listings);
    } else {
      setFilteredListings(listings.filter(listing => {
        if (filter === 'available') return listing.booking_status === 'available';
        if (filter === 'rented') return listing.booking_status === 'rented';
        if (filter === 'pending') return listing.booking_status === 'pending';
        return true;
      }));
    }
  };

  const getStatusBadge = (listing) => {
    const status = listing.booking_status || 'available';
    
    const badges = {
      available: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle,
        label: 'Available'
      },
      rented: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: Home,
        label: 'Rented'
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: Clock,
        label: 'Pending Booking'
      }
    };

    const badge = badges[status] || badges.available;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        <Icon size={16} />
        {badge.label}
      </span>
    );
  };

  const getRemainingDays = (listing) => {
    if (listing.booking_status !== 'rented' || !listing.days_remaining) return null;
    
    const days = Math.floor(listing.days_remaining);
    
    if (days < 0) return null;
    
    return (
      <div className={`flex items-center gap-2 ${days <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
        <Clock size={16} />
        <span className="font-semibold">{days} days remaining</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = {
    total: listings.length,
    available: listings.filter(l => l.booking_status === 'available').length,
    rented: listings.filter(l => l.booking_status === 'rented').length,
    pending: listings.filter(l => l.booking_status === 'pending').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-1">Manage your rental properties</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/landlord/create-listing')}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          + Add Property
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Properties</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Home size={40} className="opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available</p>
              <p className="text-3xl font-bold mt-1">{stats.available}</p>
            </div>
            <CheckCircle size={40} className="opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Rented</p>
              <p className="text-3xl font-bold mt-1">{stats.rented}</p>
            </div>
            <User size={40} className="opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-3xl font-bold mt-1">{stats.pending}</p>
            </div>
            <Clock size={40} className="opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-md p-4"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <span className="font-semibold text-gray-700">Filter:</span>
          </div>
          
          {['all', 'available', 'rented', 'pending'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === filterOption
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-12 text-center"
        >
          <Home size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Start by adding your first property'
              : `No ${filter} properties at the moment`
            }
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home size={48} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  {getStatusBadge(listing)}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h3>
                
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin size={16} />
                  <span className="text-sm">{listing.address}, {listing.city}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign size={16} className="text-primary-600" />
                    <span className="font-semibold">Rs. {listing.rent_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Bed size={16} className="text-primary-600" />
                    <span>{listing.bedrooms} BHK</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Bath size={16} className="text-primary-600" />
                    <span>{listing.bathrooms} Bath</span>
                  </div>
                </div>

                {/* Rental Info */}
                {listing.booking_status === 'rented' && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900">
                      <User size={16} />
                      <span className="font-semibold">Tenant: {listing.tenant_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 text-sm">
                      <Calendar size={14} />
                      <span>Start: {formatDate(listing.rent_start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 text-sm">
                      <Calendar size={14} />
                      <span>End: {formatDate(listing.rent_end_date)}</span>
                    </div>
                    {getRemainingDays(listing)}
                  </div>
                )}

                {listing.booking_status === 'pending' && (
                  <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-yellow-900">
                      <AlertCircle size={16} />
                      <span className="font-semibold">Booking request pending</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">Review the booking request</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/landlord/property/${listing.id}`)}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </motion.button>
                  
                  {listing.booking_status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/landlord/bookings`)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                    >
                      Review
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;
