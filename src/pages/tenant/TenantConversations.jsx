import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import socketService, { initSocket } from '../../services/socket'
import { MessageSquare, Send, Loader2, User, Search } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const TenantConversations = () => {
  const { user, accessToken } = useAuthStore()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [messagesLoading, setMessagesLoading] = useState(false)
//use effect
  useEffect(() => {
    // Initialize socket
    initSocket(accessToken)
    
    // Fetch conversations
    fetchConversations()

    // Listen for new messages
    socketService.on('receive-message', (data) => {
      console.log('[TenantConversations] Message received:', data)
      
      // Update conversations list with new last message
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === data.conversation_id) {
            return {
              ...conv,
              last_message: data.message,
              last_message_time: data.created_at,
              last_message_sender_id: data.sender_id,
              unread_count: (conv.unread_count || 0) + 1,
            }
          }
          return conv
        })
      })
      
      // Add message to current conversation if it matches
      if (selectedConversation && data.conversation_id === selectedConversation.id) {
        // Only add if not already in messages
        setMessages((prev) => {
          const exists = prev.some(m => m.id === data.id)
          if (!exists) {
            return [...prev, data]
          }
          return prev
        })
      }
      
      // Trigger dashboard badge update
      window.dispatchEvent(new Event('unreadCountChanged'))
    })

    return () => {
      socketService.off('receive-message')
    }
  }, [accessToken, selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations')
      const data = response.data.data || []
      console.log('[TenantConversations] Fetched conversations:', data)
      data.forEach(conv => {
        console.log(`[TenantConversations] Conv: ${conv.other_user_name}, last_message: "${conv.last_message}", unread: ${conv.unread_count}`)
      })
      setConversations(data)
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0])
      } else if (data.length === 0) {
        setSelectedConversation(null)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true)
      const response = await api.get(`/conversations/${conversationId}/messages`)
      setMessages(response.data.data || response.data || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSelectConversation = async (conversation) => {
    console.log('[TenantConversations] Selected conversation:', conversation)
    setSelectedConversation(conversation)
    setMessages([])
    setMessagesLoading(true)
    
    try {
      // Fetch messages for this conversation
      const response = await api.get(`/conversations/${conversation.id}/messages`)
      if (response.data && response.data.data) {
        console.log('[TenantConversations] Loaded messages:', response.data.data)
        // Sort messages in ascending order (oldest first) for proper display at bottom
        const sortedMessages = [...response.data.data].sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        )
        setMessages(sortedMessages)
      }
    } catch (error) {
      console.error('[TenantConversations] Error loading messages:', error)
    } finally {
      setMessagesLoading(false)
    }

    // Mark conversation as read
    try {
      await api.put(`/conversations/${conversation.id}/mark-read`)
      // Refresh conversations to update unread counts
      fetchConversations()
      // Emit event to notify dashboard to update badge
      window.dispatchEvent(new Event('unreadCountChanged'))
    } catch (error) {
      console.error('[TenantConversations] Error marking as read:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    setSending(true)
    const messageContent = messageText
    setMessageText('')
    
    try {
      // Send via API to persist (socket will handle real-time)
      const response = await api.post('/messages', {
        receiver_id: selectedConversation.other_user_id,
        listing_id: selectedConversation.listing_id,
        message_text: messageContent,
      })

      // Add message to local state only from API response
      if (response.data && response.data.data) {
        setMessages((prev) => {
          const sorted = [...prev, response.data.data].sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
          )
          return sorted
        })
      }
      
      // Send via socket for real-time notification
      socketService.sendMessage(
        selectedConversation.other_user_id,
        messageContent,
        selectedConversation.listing_id,
        selectedConversation.id
      )
      
      fetchConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessageText(messageContent)
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={32} className="text-primary-600" />
          <h1 className="text-3xl font-bold text-text">Messages</h1>
        </div>
        <p className="text-gray-600">Communicate with landlords</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
        {/* Conversations List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <MessageSquare size={20} />
              Conversations
            </h2>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-200" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-primary-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation, index) => (
                <motion.button
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                    selectedConversation?.id === conversation.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text truncate">
                        {conversation.other_user_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                      {conversation.last_message_time && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conversation.last_message_time).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg flex flex-col"
        >
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <h2 className="font-semibold">
                  Chat with {selectedConversation.other_user_name || 'Landlord'}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 size={32} className="animate-spin text-primary-600" />
                  </div>
                ) : messages.length > 0 ? (
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            message.sender_id === user?.id
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-text shadow-sm'
                          }`}
                        >
                          <p className="text-sm">{message.message || message.content}</p>
                          {message.created_at && (
                            <p className={`text-xs mt-1 ${
                              message.sender_id === user?.id ? 'text-primary-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default TenantConversations
