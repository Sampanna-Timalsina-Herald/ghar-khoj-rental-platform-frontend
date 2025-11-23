import { useState, useEffect } from 'react'
import api from '../../api/axios'

const LandlordConversations = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/conversations')
      setConversations(response.data.data)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading messages...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Messages</h1>
        <p className="text-gray-600 mt-2">Communicate with potential tenants</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-y-auto max-h-96">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversation?.id === conversation.id ? 'bg-primary-50' : ''
                }`}
              >
                <p className="font-semibold text-text">{conversation.participant?.name}</p>
                <p className="text-sm text-gray-600">{conversation.listing?.title}</p>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-600">No conversations yet</div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          {selectedConversation ? (
            <div>
              <h2 className="text-xl font-bold text-text mb-4">
                Chat with {selectedConversation.participant?.name}
              </h2>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {selectedConversation.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.senderId === 'current-user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-text'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                className="input-field"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-600">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LandlordConversations
