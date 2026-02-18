import React from 'react'
import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Home, Plus, MessageSquare, BarChart3, User, FileText, Calendar, CreditCard, Package, TrendingUp } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LandlordHome from './LandlordHome'
import LandlordListings from './LandlordListings'
import LandlordBookings from './LandlordBookings'
import CreateListing from './CreateListing'
import EditListing from './EditListing'
import LandlordConversations from './LandlordConversations'
import LandlordProfile from './LandlordProfile'
import LandlordAgreements from './LandlordAgreements'
import LandlordBilling from './LandlordBilling'
import SubscriptionPlans from './SubscriptionPlans'
import SubscriptionDashboard from './SubscriptionDashboard'
import { useAuthStore } from '../../stores/authStore'
import api from '../../api/axios'
import { initSocket } from '../../services/socket'

const LandlordLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { accessToken } = useAuthStore()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initialize socket and fetch unread count
  useEffect(() => {
    if (accessToken) {
      initSocket(accessToken)
      fetchUnreadCount()
    }

    // Listen for unread count changes
    const handleUnreadChange = () => {
      fetchUnreadCount()
    }
    window.addEventListener('unreadCountChanged', handleUnreadChange)
    return () => window.removeEventListener('unreadCountChanged', handleUnreadChange)
  }, [accessToken])

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/conversations')
      console.log('[LandlordDashboard] Conversations response:', response.data)
      if (response.data && response.data.data) {
        const total = response.data.data.reduce((sum, conv) => {
          console.log('[LandlordDashboard] Conv unread_count:', conv.unread_count, conv.other_user_name)
          return sum + (conv.unread_count || 0)
        }, 0)
        console.log('[LandlordDashboard] Total unread:', total)
        setUnreadCount(total)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <BarChart3 size={20} />,
    },
    {
      label: 'My Subscription',
      path: '/subscription',
      icon: <Package size={20} />,
    },
    {
      label: 'My Listings',
      path: '/listings',
      icon: <Home size={20} />,
    },
    {
      label: 'Bookings',
      path: '/bookings',
      icon: <Calendar size={20} />,
    },
    {
      label: 'Create Listing',
      path: '/listings/create',
      icon: <Plus size={20} />,
    },
    {
      label: 'Agreements',
      path: '/agreements',
      icon: <FileText size={20} />,
    },
    {
      label: 'Billing',
      path: '/billing',
      icon: <CreditCard size={20} />,
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: <MessageSquare size={20} />,
      badge: unreadCount,
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: <User size={20} />,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col lg:flex-row">
        <Sidebar
          items={menuItems}
          basePath="/landlord"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 w-full overflow-hidden p-4 lg:p-8 lg:overflow-auto">
          <Routes>
            <Route index element={<LandlordHome />} />
            <Route path="subscription" element={<SubscriptionDashboard />} />
            <Route path="subscription-plans" element={<SubscriptionPlans />} />
            <Route path="bookings" element={<LandlordBookings />} />
            <Route path="listings" element={<LandlordListings />} />
            <Route path="listings/create" element={<CreateListing />} />
            <Route path="listings/edit/:id" element={<EditListing />} />
            <Route path="agreements" element={<LandlordAgreements />} />
            <Route path="billing" element={<LandlordBilling />} />
            <Route path="messages" element={<LandlordConversations />} />
            <Route path="profile" element={<LandlordProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default LandlordLayout
