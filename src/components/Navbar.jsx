import React,{ useState } from 'react'
import { Menu, X, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { Link, useNavigate } from 'react-router-dom'
import NotificationPanel from './NotificationPanel'
import gharkhojLogo from '../assets/GHARKHOJ_LOGO.png'

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout, role } = useAuthStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

 const handleLogout = () => {
  logout() // this should clear tokens from state and localStorage
  setProfileOpen(false) // close the profile dropdown
  localStorage.removeItem('accessToken') // extra safety
  localStorage.removeItem('refreshToken') // if you use refresh tokens
  localStorage.removeItem('user') // remove stored user info
  navigate('/') // redirect to home page
}

 const getImageUrl = (profileImage) => {
  if (!profileImage) return null
  // If it's already a full URL, return as is
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
    return profileImage
  }
  // If it's still base64 data, return it as is
  if (profileImage.startsWith('data:')) {
    return profileImage
  }
  // If it starts with /uploads, prepend API base URL
  if (profileImage.startsWith('/uploads')) {
    return `http://localhost:5000${profileImage}`
  }
  // Otherwise assume it's a path that needs /api prepended
  return profileImage
}

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="flex items-center">
            <img 
              src={gharkhojLogo} 
              alt="Gharkhoj" 
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <NotificationPanel />
          <span className="text-sm text-gray-600 hidden md:inline truncate max-w-[120px] lg:max-w-none">
            {user?.name || 'User'}
          </span>
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 overflow-hidden border-2 border-white shrink-0"
            >
              {user?.profileImage ? (
                <img
                  src={getImageUrl(user.profileImage)}
                  alt={user?.name || 'Profile'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <User size={20} />
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-56 sm:w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  {user?.profileImage && (
                    <div className="mb-3">
                      <img
                        src={getImageUrl(user.profileImage)}
                        alt={user?.name || 'Profile'}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <p className="font-semibold text-text">{user?.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
