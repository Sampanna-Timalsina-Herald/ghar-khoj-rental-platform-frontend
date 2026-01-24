import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'
import socketService, { initSocket } from '../../services/socket'
import { MessageSquare, Send, Loader2, User, Search, Paperclip, Smile, Clock, Check, CheckCheck, X, File } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

// Emoji data
const EMOJI_CATEGORIES = {
  smileys: '😀😃😄😁😆😅🤣😂😊🙂🙃😉😌😌😍🥰😘😗😚😙😜😛😜😝😝🤑🤗🤭🤫🤔🤐🤨😐😑😶😏😒🙄😬🤥😌😔😪🤤😴😷🤒🤕🤮🤢🤮🤢🤮🤮🤢🤮🤮🤮🤮🤮'.split(''),
  gestures: '👋🤚🖐️✋🖖👌🤌🤏✌️🤞🫰🤟🤘🤙👍👎👊👏🙌👐🤲🤲🤝🙏💅🦵🦶👂👃🧠🦷🦴👀👁️👅👄'.split(''),
  hearts: '❤️🧡💛💚💙💜🖤🤍🤎💔💕💞💓💗💖💘💝💟'.split(''),
}

const EMOJIS = Object.values(EMOJI_CATEGORIES).flat()

const ModernChat = () => {
  const { user, accessToken } = useAuthStore()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const [pendingMessages, setPendingMessages] = useState({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef({})
  const sentMessageIdsRef = useRef(new Set())
  const fileInputRef = useRef(null)
  const emojiPickerRef = useRef(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  // Initialize socket and fetch data
  useEffect(() => {
    initSocket(accessToken)
    fetchConversations()

    // Listen for incoming messages
    socketService.on('receive-message', (data) => {
      console.log('[ModernChat] Message received:', data)

      // Check if message was already added by API response
      if (selectedConversation && data.conversation_id === selectedConversation.id) {
        setMessages((prev) => {
          // Avoid duplicates - check by id and timestamp
          const isDuplicate = prev.some(
            (m) => m.id === data.id || (m.sender_id === data.sender_id && m.created_at === data.created_at)
          )
          if (!isDuplicate) {
            return [...prev, data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          }
          return prev
        })
      }

      // Update conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.conversation_id
            ? {
                ...conv,
                last_message: data.message || data.message_text,
                last_message_time: data.created_at,
                last_message_sender_id: data.sender_id,
                unread_count: data.sender_id !== user?.id ? (conv.unread_count || 0) + 1 : 0,
              }
            : conv
        )
      )

      window.dispatchEvent(new Event('unreadCountChanged'))
    })

    // Listen for typing indicators
    socketService.on('user-typing', (data) => {
      setTypingUsers((prev) => ({ ...prev, [data.userId]: true }))
    })

    socketService.on('user-stopped-typing', (data) => {
      setTypingUsers((prev) => {
        const updated = { ...prev }
        delete updated[data.userId]
        return updated
      })
    })

    socketService.on('message-read', (data) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.messageId ? { ...msg, is_read: true } : msg))
      )
    })

    return () => {
      socketService.off('receive-message')
      socketService.off('user-typing')
      socketService.off('user-stopped-typing')
      socketService.off('message-read')
    }
  }, [accessToken, selectedConversation, user?.id])

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations')
      const data = response.data.data || []
      setConversations(data)
      // Don't auto-select any conversation - let user click to select
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation)
    setMessages([])
    setMessagesLoading(true)
    sentMessageIdsRef.current.clear()

    try {
      const response = await api.get(`/conversations/${conversation.id}/messages`)
      if (response.data && response.data.data) {
        const sortedMessages = [...response.data.data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        setMessages(sortedMessages)
        // Track loaded messages to avoid duplicates
        sortedMessages.forEach((msg) => sentMessageIdsRef.current.add(msg.id))
      }
    } catch (error) {
      console.error('[ModernChat] Error loading messages:', error)
    } finally {
      setMessagesLoading(false)
    }

    // Mark as read
    try {
      await api.put(`/conversations/${conversation.id}/mark-read`)
      fetchConversations()
      window.dispatchEvent(new Event('unreadCountChanged'))
    } catch (error) {
      console.error('[ModernChat] Error marking as read:', error)
    }
  }

  const handleSendMessage = async () => {
    if ((!messageText.trim() && attachedFiles.length === 0) || !selectedConversation) return

    const optimisticId = `temp-${Date.now()}-${Math.random()}`
    const messageContent = messageText
    setMessageText('')
    setSending(true)

    // Add optimistic message
    const optimisticMessage = {
      id: optimisticId,
      sender_id: user?.id,
      receiver_id: selectedConversation.other_user_id,
      message: messageContent,
      created_at: new Date().toISOString(),
      is_read: false,
      status: 'pending',
      attachments: attachedFiles,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setPendingMessages((prev) => ({ ...prev, [optimisticId]: true }))
    setAttachedFiles([])
    scrollToBottom()

    try {
      const formData = new FormData()
      formData.append('receiver_id', selectedConversation.other_user_id)
      formData.append('listing_id', selectedConversation.listing_id)
      formData.append('message_text', messageContent)

      // Add files to form data
      attachedFiles.forEach((file) => {
        formData.append('attachments', file.file)
      })

      const response = await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data?.data) {
        const savedMessage = response.data.data
        sentMessageIdsRef.current.add(savedMessage.id)

        // Replace optimistic message with real one
        setMessages((prev) =>
          prev
            .map((msg) => (msg.id === optimisticId ? { ...savedMessage, status: 'sent' } : msg))
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        )

        setPendingMessages((prev) => {
          const updated = { ...prev }
          delete updated[optimisticId]
          return updated
        })
      }

      // Send via socket only for real-time notification (not for persistence)
      socketService.sendMessage(
        selectedConversation.other_user_id,
        messageContent,
        selectedConversation.listing_id,
        selectedConversation.id
      )

      // Refresh conversations
      fetchConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
      // Restore the text if send failed
      setMessageText(messageContent)
      // Remove optimistic message
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
      setPendingMessages((prev) => {
        const updated = { ...prev }
        delete updated[optimisticId]
        return updated
      })
    } finally {
      setSending(false)
    }
  }

  const handleAddEmoji = (emoji) => {
    setMessageText((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    const newFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }))
    setAttachedFiles((prev) => [...prev, ...newFiles])
  }

  const removeAttachment = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTyping = () => {
    if (!selectedConversation) return

    socketService.sendTypingIndicator(selectedConversation.other_user_id, selectedConversation.id)

    // Clear existing timeout
    if (typingTimeoutRef.current[selectedConversation.id]) {
      clearTimeout(typingTimeoutRef.current[selectedConversation.id])
    }

    // Set new timeout to stop typing indicator after 3 seconds
    typingTimeoutRef.current[selectedConversation.id] = setTimeout(() => {
      socketService.sendStopTyping(selectedConversation.other_user_id, selectedConversation.id)
    }, 3000)
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isOtherUserTyping = selectedConversation && typingUsers[selectedConversation.other_user_id]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full">
            <MessageSquare size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text">Messages</h1>
            <p className="text-gray-600">Chat with landlords</p>
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)] rounded-2xl overflow-hidden">
        {/* Conversations List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-b from-slate-50 to-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-200"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/20 text-white placeholder-primary-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {filteredConversations.length > 0 ? (
              <AnimatePresence>
                {filteredConversations.map((conversation, index) => (
                  <motion.button
                    key={conversation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full px-4 py-3 border-b border-gray-100 hover:bg-primary-50 transition-all text-left group ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-primary-50 border-l-4 border-primary-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
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
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex-shrink-0 shadow-md"
                        >
                          {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                        </motion.span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">No conversations</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-xl flex flex-col border border-gray-200 overflow-hidden"
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold">{selectedConversation.other_user_name || 'Landlord'}</h2>
                    <p className="text-sm text-primary-100">Active now</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 size={32} className="animate-spin text-primary-600" />
                  </div>
                ) : messages.length > 0 ? (
                  <AnimatePresence>
                    {messages.map((message, index) => {
                      const isOwnMessage = message.sender_id === user?.id
                      const isPending = message.status === 'pending'

                      return (
                        <motion.div
                          key={message.id || index}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all ${
                              isOwnMessage
                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-bl-3xl'
                                : 'bg-white text-text border border-gray-200 rounded-br-3xl'
                            } ${isPending ? 'opacity-75' : ''}`}
                          >
                            {message.message && (
                              <p className="text-sm leading-relaxed">{message.message || message.message_text}</p>
                            )}

                            {/* Attachments */}
                            {(message.attachments || []).length > 0 && (
                              <div className="mt-2 space-y-2">
                                {(message.attachments || []).map((attachment, idx) => (
                                  <a
                                    key={idx}
                                    href={attachment.path}
                                    download={attachment.filename}
                                    className={`flex items-center gap-2 p-2 rounded-lg transition ${
                                      isOwnMessage
                                        ? 'bg-white/20 hover:bg-white/30'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                  >
                                    <File size={16} />
                                    <span className="text-xs truncate">{attachment.filename}</span>
                                  </a>
                                ))}
                              </div>
                            )}

                            <div
                              className={`flex items-center justify-end gap-2 mt-2 text-xs ${
                                isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                              }`}
                            >
                              <span>
                                {new Date(message.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isOwnMessage && (
                                <>
                                  {isPending ? (
                                    <Clock size={14} />
                                  ) : message.is_read ? (
                                    <CheckCheck size={14} />
                                  ) : (
                                    <Check size={14} />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="font-medium">No messages yet</p>
                      <p className="text-sm mt-2">Start the conversation!</p>
                    </div>
                  </div>
                )}

                {/* Typing Indicator */}
                {isOtherUserTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -8, 0] }}
                            transition={{ delay: i * 0.1, duration: 0.6, repeat: Infinity }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">typing...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                {/* Attachments Preview */}
                {attachedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 flex flex-wrap gap-2"
                  >
                    {attachedFiles.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
                      >
                        <File size={16} className="text-primary-600" />
                        <span className="text-gray-700 truncate max-w-[150px]">{attachment.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="p-0.5 hover:bg-gray-200 rounded transition"
                        >
                          <X size={16} className="text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Input Controls */}
                <div className="flex gap-2 items-end relative">
                  {/* File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="*/*"
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 hover:bg-gray-100 rounded-full transition text-gray-600 hover:text-primary-600"
                      title="Attach file"
                    >
                      <Paperclip size={20} />
                    </motion.button>

                    {/* Emoji Picker */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2.5 hover:bg-gray-100 rounded-full transition text-gray-600 hover:text-primary-600"
                        title="Add emoji"
                      >
                        <Smile size={20} />
                      </motion.button>

                      {/* Emoji Picker Popup */}
                      <AnimatePresence>
                        {showEmojiPicker && (
                          <motion.div
                            ref={emojiPickerRef}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 w-64"
                          >
                            <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
                              {EMOJIS.map((emoji, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleAddEmoji(emoji)}
                                  className="text-2xl p-1 hover:bg-gray-100 rounded transition cursor-pointer hover:scale-110"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Message Input */}
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value)
                      handleTyping()
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />

                  {/* Send Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={(messageText.trim() === '' && attachedFiles.length === 0) || sending}
                    className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
                <MessageSquare size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold">Select a conversation</p>
                <p className="text-sm mt-2">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ModernChat
