import React, { useCallback } from 'react'
import { Toaster, toast } from 'sonner'

const ToastContext = React.createContext()

export const ToastProvider = ({ children }) => {
  // Wrapper function that maintains compatibility with old API
  // addToast(message, type, duration) -> toast[type](message, { duration })
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const options = duration > 0 ? { duration } : {}
    
    switch (type) {
      case 'success':
        return toast.success(message, options)
      case 'error':
        return toast.error(message, options)
      case 'warning':
        return toast.warning(message, options)
      case 'info':
      default:
        return toast.info(message, options)
    }
  }, [])

  const removeToast = useCallback((id) => {
    toast.dismiss(id)
  }, [])

  const value = {
    addToast,
    removeToast,
    // Also expose the raw toast function for direct Sonner usage
    toast,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            padding: '16px 24px',
            fontSize: '15px',
            minWidth: '300px',
          },
        }}
      />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Export toast directly for simpler usage without context
export { toast }
