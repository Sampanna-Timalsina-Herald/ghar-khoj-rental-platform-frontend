import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import React from 'react'

const Sidebar = ({ items, basePath, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === `${basePath}${path}`
  }

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container - Desktop Sticky, Mobile Fixed */}
      <aside
        className={`
          fixed lg:sticky top-16 lg:top-16 left-0 
          w-64 h-[calc(100vh-64px)] 
          bg-white shadow-lg 
          transform lg:transform-none 
          transition-transform duration-300 ease-in-out
          z-40 lg:z-10
          overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6">
          {/* Close Button - Mobile Only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X size={24} className="text-gray-700" />
          </button>

          {/* Navigation Menu */}
          <nav className="space-y-2 mt-8 lg:mt-0">
            {items.map((item) => (
              <Link
                key={item.path}
                to={`${basePath}${item.path}`}
                onClick={() => {
                  // Only close sidebar on mobile
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg 
                  transition-all duration-200 font-medium relative
                  ${
                    isActive(item.path)
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                  }
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className={`
                    inline-flex items-center justify-center 
                    w-6 h-6 rounded-full text-xs font-bold
                    ${isActive(item.path) 
                      ? 'bg-white text-primary-600' 
                      : 'bg-red-500 text-white'
                    }
                  `}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
