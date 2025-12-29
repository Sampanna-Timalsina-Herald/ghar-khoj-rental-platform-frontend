import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Users, Home, AlertCircle, BarChart3, User as UserIcon } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import AdminHome from './AdminHome'
import AdminListings from './AdminListings'
import AdminUsers from './AdminUsers'
import AdminProfile from './AdminProfile'

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
      label: 'Reports',
      path: '/reports',
      icon: <AlertCircle size={20} />,
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
            <Route path="profile" element={<AdminProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
