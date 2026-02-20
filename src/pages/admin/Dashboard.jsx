import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Users, Home, AlertCircle, BarChart3, User as UserIcon, TrendingUp, Settings as SettingsIcon, DollarSign, Package, Calendar } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import AdminHome from './AdminHome'
import AdminListings from './AdminListings'
import AdminUsers from './AdminUsers'
import AdminProfile from './AdminProfile'
import AdvancedReports from './AdvancedReports'
import AdminSettings from './AdminSettings'
import AdminCommissionDashboard from './AdminCommissionDashboard'
import ComprehensiveAnalyticsDashboard from './ComprehensiveAnalyticsDashboard'
import AdminSubscriptions from './AdminSubscriptions'
import AdminSubscriptionHistory from './AdminSubscriptionHistory'

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <BarChart3 size={20} />,
    },
    {
      label: 'Listings',
      path: '/listings',
      icon: <Home size={20} />,
    },
    {
      label: 'Users',
      path: '/users',
      icon: <Users size={20} />,
    },
    {
      label: 'Commissions',
      path: '/commissions',
      icon: <DollarSign size={20} />,
    },
    {
      label: 'Subscriptions',
      path: '/subscriptions',
      icon: <Package size={20} />,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: <TrendingUp size={20} />,
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: <BarChart3 size={20} />,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <SettingsIcon size={20} />,
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: <UserIcon size={20} />,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col lg:flex-row">
        <Sidebar
          items={menuItems}
          basePath="/admin"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 w-full overflow-hidden p-4 lg:p-8 lg:overflow-auto">
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="commissions" element={<AdminCommissionDashboard />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="subscriptions/history" element={<AdminSubscriptionHistory />} />
            <Route path="reports" element={<AdvancedReports />} />
            <Route path="analytics" element={<ComprehensiveAnalyticsDashboard />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
