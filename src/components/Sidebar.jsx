import { Link, useLocation } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Sidebar = ({ items, basePath, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isHovering, setIsHovering] = useState(false)

  const isActive = (path) => {
    return location.pathname === `${basePath}${path}`
  }

  // Show expanded sidebar when hovering or not collapsed
  const showExpanded = !isCollapsed || isHovering

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          fixed lg:sticky top-16 lg:top-16 left-0 
          ${showExpanded ? 'w-64' : 'w-20'} 
          h-[calc(100vh-64px)] 
          bg-white shadow-lg 
          transform lg:transform-none 
          transition-all duration-300 ease-in-out
          z-40 lg:z-10
          overflow-hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header with Toggle Button */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {showExpanded && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-gray-800"
              >
                Menu
              </motion.h3>
            )}
            
            {/* Desktop Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={20} className="text-gray-600" />
              ) : (
                <ChevronLeft size={20} className="text-gray-600" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {items.map((item) => (
              <Link
                key={item.path}
                to={`${basePath}${item.path}`}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false)
                  }
                }}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg 
                  transition-all duration-200 font-medium relative
                  group
                  ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                  }
                `}
                title={!showExpanded ? item.label : ''}
              >
                {/* Icon */}
                <span className={`flex-shrink-0 ${showExpanded ? '' : 'mx-auto'}`}>
                  {item.icon}
                </span>

                {/* Label - Show when expanded */}
                <AnimatePresence>
                  {showExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`
                      inline-flex items-center justify-center 
                      ${showExpanded ? 'w-6 h-6' : 'w-5 h-5 absolute -top-1 -right-1'}
                      rounded-full text-xs font-bold
                      ${isActive(item.path) 
                        ? 'bg-white text-primary-600' 
                        : 'bg-red-500 text-white'
                      }
                    `}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}

                {/* Tooltip for collapsed state */}
                {!showExpanded && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer - Collapse hint */}
          {showExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden lg:block p-3 border-t border-gray-200"
            >
              <p className="text-xs text-gray-500 text-center">
                {isCollapsed ? 'Hover to expand' : 'Click arrow to collapse'}
              </p>
            </motion.div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
