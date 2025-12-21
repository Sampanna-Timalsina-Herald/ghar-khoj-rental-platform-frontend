import React, { useState } from 'react'
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
      <div className="flex">
        <Sidebar
          items={menuItems}
          basePath="/admin"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 p-4 lg:p-8">
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
