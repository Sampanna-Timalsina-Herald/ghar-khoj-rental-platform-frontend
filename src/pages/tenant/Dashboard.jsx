import React, { useState } from "react";
import { Routes, Route } from 'react-router-dom'
import { Search, Heart, MessageSquare, BarChart3 } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import TenantHome from './TenantHome'
import TenantBrowse from './TenantBrowse'
import TenantFavorites from './TenantFavorites'
import TenantConversations from './TenantConversations'

const TenantDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar
          items={menuItems}
          basePath="/tenant"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 p-4 lg:p-8">
          <Routes>
            <Route index element={<TenantHome />} />
            <Route path="browse" element={<TenantBrowse />} />
            <Route path="favorites" element={<TenantFavorites />} />
            <Route path="messages" element={<TenantConversations />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default TenantDashboard
