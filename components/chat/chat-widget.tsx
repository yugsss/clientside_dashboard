"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, X, Minimize2, Bot, User } from "lucide-react"
import { useAuthStore } from "../../stores/auth-store"

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai" | "support"
  timestamp: Date
  senderName?: string
}

export function ChatWidget() {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hi! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (message.includes("project") || message.includes("video")) {
      return "I can help you with project management! You can view your projects, add comments, and track progress. Would you like me to show you how to add revision requests?"
    }

    if (message.includes("revision") || message.includes("change")) {
      return "To request revisions, go to your project's Comments tab, select 'Revision Request' as the comment type, specify your timeframe, and describe the changes you'd like. Your editor will be notified immediately!"
    }

    if (message.includes("frame.io") || message.includes("frameio")) {
      return "Frame.io integration allows you to review videos directly in the platform. You can leave timestamped comments and collaborate with your editor in real-time. Need help setting this up?"
    }

    if (message.includes("status") || message.includes("progress")) {
      return "You can check project status and progress on your dashboard or in the Projects section. Each project shows completion percentage and current status (active, completed, on hold, etc.)."
    }

    if (message.includes("help") || message.includes("support")) {
      return "I'm here to help! You can ask me about projects, revisions, Frame.io integration, or general platform usage. If you need human support, I can connect you with our team."
    }

    if (message.includes("human") || message.includes("agent") || message.includes("person")) {
      return "I'll connect you with a human team member right away! Sarah from our editing team will join this chat shortly to assist you personally."
    }

    return "Thanks for your message! I can help you with project management, revision requests, Frame.io integration, and general platform questions. What would you like to know more about?"
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
      senderName: user?.name,
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(newMessage),
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)

      // If user asked for human support, simulate human joining
      if (newMessage.toLowerCase().includes("human") || newMessage.toLowerCase().includes("agent")) {
        setTimeout(() => {
          const humanMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            content: "Hi! I'm Sarah from the editing team. I saw you needed some help - what can I assist you with?",
            sender: "support",
            timestamp: new Date(),
            senderName: "Sarah Wilson",
          }
          setMessages((prev) => [...prev, humanMessage])
        }, 3000)
      }
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 shadow-lg z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-96 bg-slate-800 border-slate-700 shadow-xl z-50 transition-all duration-300 ${
        isMinimized ? "h-16" : "h-[500px]"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-700">
        <CardTitle className="text-white text-lg flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-purple-400" />
          Live Support
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-full p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className={
                      message.sender === "ai"
                        ? "bg-purple-600 text-white"
                        : message.sender === "support"
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white"
                    }
                  >
                    {message.sender === "ai" ? (
                      <Bot className="h-4 w-4" />
                    ) : message.sender === "support" ? (
                      message.senderName?.charAt(0).toUpperCase()
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 ${message.sender === "user" ? "text-right" : ""}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-slate-400">
                      {message.sender === "ai"
                        ? "AI Assistant"
                        : message.sender === "support"
                          ? message.senderName
                          : message.senderName || "You"}
                    </span>
                    {message.sender === "ai" && <Badge className="bg-purple-900/20 text-purple-400 text-xs">AI</Badge>}
                    {message.sender === "support" && (
                      <Badge className="bg-green-900/20 text-green-400 text-xs">Team</Badge>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg max-w-xs ${
                      message.sender === "user" ? "bg-purple-600 text-white ml-auto" : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
