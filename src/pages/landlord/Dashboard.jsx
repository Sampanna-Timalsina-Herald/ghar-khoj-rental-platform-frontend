import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Home, Plus, MessageSquare, BarChart3 } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LandlordHome from './LandlordHome'
import LandlordListings from './LandlordListings'
import CreateListing from './CreateListing'
import LandlordConversations from './LandlordConversations'

const LandlordDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <BarChart3 size={20} />,
    },
    {
      label: 'My Listings',
      path: '/listings',
      icon: <Home size={20} />,
    },
    {
      label: 'Create Listing',
      path: '/listings/create',
      icon: <Plus size={20} />,
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
          basePath="/landlord"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 p-4 lg:p-8">
          <Routes>
            <Route index element={<LandlordHome />} />
            <Route path="listings" element={<LandlordListings />} />
            <Route path="listings/create" element={<CreateListing />} />
            <Route path="messages" element={<LandlordConversations />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default LandlordDashboard
