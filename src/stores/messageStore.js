import { create } from 'zustand'

export const useMessageStore = create((set) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],

  setConversations: (conversations) => set({ conversations }),
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations],
  })),
}))
