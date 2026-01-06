import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

let socket = null
let socketCallbacks = {}

export const initSocket = (token) => {
  if (socket?.connected) {
    console.log('[Socket] Already connected')
    return socket
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected')
  })

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error)
  })

  // Listen for incoming messages (from REST API via socket emission)
  socket.on('receive-message', (data) => {
    console.log('[Socket] Message received from sender:', data)
    if (socketCallbacks.onMessageReceived) {
      socketCallbacks.onMessageReceived(data)
    }
  })

  // Listen for message notifications (real-time only, not for display)
  socket.on('message-notification', (data) => {
    console.log('[Socket] Message notification (real-time):', data)
    // This is just a notification that a message was sent
    // The actual message will come from the API response
    if (socketCallbacks.onMessageNotification) {
      socketCallbacks.onMessageNotification(data)
    }
  })

  // Listen for typing indicator
  socket.on('user-typing', (data) => {
    console.log('[Socket] User typing:', data)
    if (socketCallbacks.onUserTyping) {
      socketCallbacks.onUserTyping(data)
    }
  })

  // Listen for stop typing
  socket.on('user-stopped-typing', (data) => {
    console.log('[Socket] User stopped typing:', data)
    if (socketCallbacks.onUserStoppedTyping) {
      socketCallbacks.onUserStoppedTyping(data)
    }
  })

  // Listen for message read
  socket.on('message-read', (data) => {
    console.log('[Socket] Message read:', data)
    if (socketCallbacks.onMessageRead) {
      socketCallbacks.onMessageRead(data)
    }
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    console.log('[Socket] Disconnected and cleaned up')
  }
}

export const sendMessage = (receiverId, message, listingId = null, conversationId = null) => {
  if (!socket?.connected) {
    console.error('[Socket] Not connected - cannot send message')
    return false
  }

  socket.emit('send-message', {
    receiverId,
    message,
    listingId,
    conversationId,
  })
  console.log('[Socket] Message sent to', receiverId)
  return true
}

export const sendTypingIndicator = (receiverId, conversationId) => {
  if (!socket?.connected) {
    console.warn('[Socket] Not connected - cannot send typing indicator')
    return
  }
  socket.emit('typing', { receiverId, conversationId })
}

export const sendStopTyping = (receiverId, conversationId) => {
  if (!socket?.connected) {
    console.warn('[Socket] Not connected - cannot send stop typing')
    return
  }
  socket.emit('stop-typing', { receiverId, conversationId })
}

export const markMessageAsRead = (messageId, conversationId, senderId) => {
  if (!socket?.connected) {
    console.warn('[Socket] Not connected - cannot mark message as read')
    return
  }
  socket.emit('mark-read', { messageId, conversationId, senderId })
}

export const on = (event, callback) => {
  const callbackKey = `on${event.charAt(0).toUpperCase() + event.slice(1)}`
  socketCallbacks[callbackKey] = callback
  console.log('[Socket] Registered callback for event:', event)
}

export const off = (event) => {
  const callbackKey = `on${event.charAt(0).toUpperCase() + event.slice(1)}`
  socketCallbacks[callbackKey] = null
  console.log('[Socket] Unregistered callback for event:', event)
}

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  sendMessage,
  sendTypingIndicator,
  sendStopTyping,
  markMessageAsRead,
  on,
  off,
}

