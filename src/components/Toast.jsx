import { AlertCircle, Check, Info, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <Check size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  }

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg border-l-4 ${colors[type]} flex items-center gap-3 max-w-sm shadow-lg z-50`}>
      <div>{icons[type]}</div>
      <p>{message}</p>
      <button onClick={onClose} className="ml-auto">
        <X size={18} />
      </button>
    </div>
  )
}

export default Toast
