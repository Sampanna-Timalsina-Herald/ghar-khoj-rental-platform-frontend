import React, { useState, useEffect, useRef } from 'react'
import { Send, Loader2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../api/axios'
import socketService, { initSocket } from '../services/socket'
import { useAuthStore } from '../stores/authStore'

const TenantMessages = ({ landlordId, listingId, landlordName, onBack }) => {
  const { user, accessToken } = useAuthStore()
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

    setSending(true)
    try {
      // Send via API
      const response = await api.post('/messages', {
        receiver_id: landlordId,
        listing_id: listingId,
        message_text: newMessage,
      })

      // Get the message from response (could be response.data.data or response.data)
      const messageData = response.data.data || response.data

      // Add to local messages
      setMessages((prev) => [
        ...prev,
        {
          id: messageData.id || Date.now(),
          sender_id: user.id,
          receiver_id: landlordId,
          message_text: newMessage,
          created_at: messageData.created_at || new Date().toISOString(),
          is_read: false,
        },
      ])

      // Send via socket for real-time
      socketService.sendMessage(landlordId, newMessage, listingId)
      
      setNewMessage('')
      scrollToBottom()
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message')
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
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h3 className="font-bold text-gray-900">{landlordName || 'Landlord'}</h3>
            <p className="text-xs text-gray-600">Property Owner</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === user.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{msg.message_text || msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender_id === user.id ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-600"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </motion.button>
        </div>
      </form>
    </div>
  )
}

export default TenantMessages
