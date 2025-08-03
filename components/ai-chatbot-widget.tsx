"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Minimize2, Maximize2 } from "lucide-react"

export function AIChatbotWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState("")

  const suggestions = ["Documents uploaded today?", "Show recent edits", "Storage usage?"]

  return (
    <Card
      className={`transition-all duration-200 border-gray-100 bg-white shadow-sm h-full ${isExpanded ? "min-h-80" : "h-auto"}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-gray-50 rounded-md">
              <MessageCircle className="h-3 w-3 text-gray-600" />
            </div>
            <CardTitle className="text-sm font-medium text-gray-900">AI Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!isExpanded ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Ask me anything about your documents</p>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full text-left justify-start text-xs h-7 bg-gray-50 hover:bg-gray-100 text-gray-600 font-normal"
                onClick={() => {
                  setMessage(suggestion)
                  setIsExpanded(true)
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-32 bg-gray-50 rounded-md p-3 overflow-y-auto">
              <div className="space-y-2">
                <div className="bg-white rounded-lg p-2 max-w-[80%] shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-700">Hello! I'm your AI assistant. How can I help you today?</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && setMessage("")}
                className="h-8 bg-gray-50 border-gray-200 text-xs"
              />
              <Button size="icon" onClick={() => setMessage("")} className="h-8 w-8 bg-gray-900 hover:bg-gray-800">
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
