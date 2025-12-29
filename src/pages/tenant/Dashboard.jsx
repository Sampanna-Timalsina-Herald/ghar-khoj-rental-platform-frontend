import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom'
import { Search, Heart, MessageSquare, BarChart3, User } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import TenantHome from './TenantHome'
import TenantBrowse from './TenantBrowse'
import TenantFavorites from './TenantFavorites'
import TenantConversations from './TenantConversations'
import TenantProfile from './TenantProfile'
import { useAuthStore } from '../../stores/authStore'
import api from '../../api/axios'
import { initSocket } from '../../services/socket'

const TenantDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { accessToken } = useAuthStore()

  // Close sidebar on window resize if it becomes large enough
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
      console.log('[Dashboard] Conversations response:', response.data)
      if (response.data && response.data.data) {
        const total = response.data.data.reduce((sum, conv) => {
          console.log('[Dashboard] Conv unread_count:', conv.unread_count, conv.other_user_name)
          return sum + (conv.unread_count || 0)
        }, 0)
        console.log('[Dashboard] Total unread:', total)
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
      label: 'Browse Listings',
      path: '/browse',
      icon: <Search size={20} />,
    },
    {
      label: 'Favorites',
      path: '/favorites',
      icon: <Heart size={20} />,
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
          basePath="/tenant"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 w-full overflow-hidden p-4 lg:p-8 lg:overflow-auto">
          <Routes>
            <Route index element={<TenantHome />} />
            <Route path="browse" element={<TenantBrowse />} />
            <Route path="favorites" element={<TenantFavorites />} />
            <Route path="messages" element={<TenantConversations />} />
            <Route path="profile" element={<TenantProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default TenantDashboard
