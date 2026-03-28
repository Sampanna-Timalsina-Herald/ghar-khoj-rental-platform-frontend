// This component is deprecated - use toast from 'sonner' or useToast from ToastContext instead
// Kept for backwards compatibility

import { toast } from 'sonner'

/**
 * @deprecated Use `import { toast } from 'sonner'` directly instead
 * 
 * Example usage:
 * - toast.success("Message")
 * - toast.error("Error message") 
 * - toast.info("Info message")
 * - toast.warning("Warning message")
 */
const Toast = ({ message, type = 'info', onClose, duration = 1500 }) => {
  // Trigger the Sonner toast when this component mounts
  const options = { duration, onDismiss: onClose, onAutoClose: onClose }
  
  switch (type) {
    case 'success':
      toast.success(message, options)
      break
    case 'error':
      toast.error(message, options)
      break
    case 'warning':
      toast.warning(message, options)
      break
    default:
      toast.info(message, options)
  }

  // Return null since Sonner handles the rendering
  return null
}

export default Toast
