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
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed lg:relative top-16 lg:top-0 left-0 w-64 h-[calc(100vh-64px)] lg:h-screen bg-white shadow-lg transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4"
          >
            <X size={24} />
          </button>
          <nav className="space-y-2 mt-8 lg:mt-0">
            {items.map((item) => (
              <Link
                key={item.path}
                to={`${basePath}${item.path}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
