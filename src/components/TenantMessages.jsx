import React, { useState, useEffect, useRef } from 'react'
import { Send, Loader2, ArrowLeft, MessageCircle, User, Check, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import socketService, { initSocket } from '../services/socket'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../context/ToastContext'

const TenantMessages = ({ landlordId, listingId, landlordName, onBack }) => {
  const { user, accessToken } = useAuthStore()
  const { addToast } = useToast()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    // Initialize socket
    initSocket(accessToken)
    
    // Load message history
    fetchMessages()

    // Listen for new messages
    socketService.on('MessageReceived', (data) => {
      setMessages((prev) => [...prev, data])
      scrollToBottom()
    })

    socketService.on('UserTyping', (data) => {
      if (data.senderId === landlordId) {
        setIsTyping(true)
      }
    })

    socketService.on('UserStoppedTyping', (data) => {
      if (data.senderId === landlordId) {
        setIsTyping(false)
      }
    })

    return () => {
      socketService.off('MessageReceived')
      socketService.off('UserTyping')
      socketService.off('UserStoppedTyping')
    }
  }, [landlordId, accessToken])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/messages/conversation/${landlordId}`, {
        params: { listing_id: listingId }
      })
      setMessages(response.data.data || response.data || [])
      scrollToBottom()
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageContent = newMessage
    setNewMessage('')
    setSending(true)

    // Optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: landlordId,
      message_text: messageContent,
      created_at: new Date().toISOString(),
      is_read: false,
      status: 'sending',
    }

    setMessages((prev) => [...prev, optimisticMessage])
    scrollToBottom()

    try {
      // Send via API
      const response = await api.post('/messages', {
        receiver_id: landlordId,
        listing_id: listingId,
        message_text: messageContent,
      })

      // Get the message from response
      const messageData = response.data.data || response.data

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? {
                id: messageData.id || Date.now(),
                sender_id: user.id,
                receiver_id: landlordId,
                message_text: messageContent,
                created_at: messageData.created_at || new Date().toISOString(),
                is_read: false,
                status: 'sent',
              }
            : msg
        )
      )

      // Send via socket for real-time
      socketService.sendMessage(landlordId, messageContent, listingId)
      scrollToBottom()
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
      setNewMessage(messageContent) // Restore message text
      addToast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleTyping = () => {
    socketService.sendTypingIndicator(landlordId, `conversation-${user.id}-${landlordId}`)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to send stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendStopTyping(landlordId, `conversation-${user.id}-${landlordId}`)
    }, 2000)
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-96 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Loading messages...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-96 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
    >
      {/* Header with Gradient */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 p-4 flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
                <User size={20} className="text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{landlordName || 'Landlord'}</h3>
              <p className="text-xs text-primary-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Active now
              </p>
            </div>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"
        >
          <MessageCircle size={20} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Messages Area with Gradient Background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 via-white to-primary-50/30 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="mb-4 p-4 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full"
              >
                <MessageCircle size={40} className="text-primary-600" />
              </motion.div>
              <p className="text-gray-600 font-medium text-lg mb-2">No messages yet</p>
              <p className="text-gray-500 text-sm">Start the conversation!</p>
            </motion.div>
          ) : (
            messages.map((msg, idx) => {
              const isOwnMessage = msg.sender_id === user.id
              const isSending = msg.status === 'sending'

              return (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`max-w-xs px-4 py-3 rounded-2xl shadow-md transition-all ${
                      isOwnMessage
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                    } ${isSending ? 'opacity-70' : ''}`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {msg.message_text || msg.message}
                    </p>
                    <div
                      className={`flex items-center justify-end gap-1.5 mt-2 text-xs ${
                        isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isOwnMessage && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {isSending ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : msg.is_read ? (
                            <CheckCheck size={14} className="text-green-300" />
                          ) : (
                            <Check size={14} />
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>

        {/* Enhanced Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div className="bg-white text-gray-900 border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          delay: i * 0.15,
                          duration: 0.6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="w-2 h-2 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 ml-1">typing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input Area */}
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-4 bg-gradient-to-r from-white to-gray-50"
      >
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-full focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all shadow-sm"
            />
            {newMessage && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              </motion.div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full hover:shadow-lg hover:shadow-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 disabled:hover:scale-100"
          >
            {sending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  )
}

export default TenantMessages
