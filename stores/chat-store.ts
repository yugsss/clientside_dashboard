import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { ChatMessage } from "../types"

interface ChatState {
  messages: ChatMessage[]
  currentProjectId: number | null
  loading: boolean
  connected: boolean
  error: string | null

  // Actions
  fetchMessages: (projectId?: number) => Promise<void>
  sendMessage: (content: string, projectId?: number) => Promise<void>
  setCurrentProject: (projectId: number | null) => void
  connectChat: () => void
  disconnectChat: () => void
  clearError: () => void
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      messages: [],
      currentProjectId: null,
      loading: false,
      connected: false,
      error: null,

      fetchMessages: async (projectId?: number) => {
        const currentState = get()
        if (currentState.loading) return

        set({ loading: true, error: null })
        try {
          const url = projectId ? `/api/chat/messages?projectId=${projectId}` : "/api/chat/messages"

          const response = await fetch(url)

          if (!response.ok) {
            throw new Error("Failed to fetch messages")
          }

          const data = await response.json()
          set({
            messages: data.messages || [],
            loading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch messages",
            loading: false,
          })
        }
      },

      sendMessage: async (content: string, projectId?: number) => {
        if (!content.trim()) return

        const currentState = get()
        if (currentState.loading) return

        set({ loading: true, error: null })
        try {
          const response = await fetch("/api/chat/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: content.trim(),
              projectId,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to send message")
          }

          const data = await response.json()

          // Add the new message to the current messages
          set((state) => ({
            messages: [...state.messages, data.message],
            loading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to send message",
            loading: false,
          })
        }
      },

      setCurrentProject: (projectId: number | null) => {
        const currentState = get()
        if (currentState.currentProjectId !== projectId) {
          set({ currentProjectId: projectId, messages: [] })
          // Fetch messages for the new project
          if (projectId) {
            get().fetchMessages(projectId)
          } else {
            get().fetchMessages()
          }
        }
      },

      connectChat: () => {
        const currentState = get()
        if (!currentState.connected) {
          set({ connected: true })
          // Fetch initial messages
          get().fetchMessages(currentState.currentProjectId || undefined)
        }
      },

      disconnectChat: () => {
        const currentState = get()
        if (currentState.connected) {
          set({ connected: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "chat-store" },
  ),
)
