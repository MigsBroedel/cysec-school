"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Send, User, Plus, Paperclip, Mic } from "lucide-react"
import { CysecRobot } from "@/components/cysec-robot"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
}

export default function CysecChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [situation, setSituation] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === "bot") {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          situation: situation,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro na API")
      }

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Desculpe, ocorreu um erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const newChat = () => {
    setMessages([])
    setSituation("")
    setInputMessage("")
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-md flex-shrink-0 relative z-50">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - New chat */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={newChat}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova conversa
              </Button>
            </div>

            {/* Center - Logo */}
            <div className="flex items-center gap-2 sm:gap-3 absolute left-1/2 transform -translate-x-1/2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span className="font-bold text-lg sm:text-xl text-white">Cysec</span>
            </div>

          
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 lg:py-12 scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-slate-800"
        >
          <div className="max-w-5xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center min-h-[60vh]">
                <div className="mb-6 sm:mb-12">
                  <div className="mb-4 sm:mb-8">
                    <CysecRobot size="lg" animated={true} className="mx-auto" />
                  </div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Cysec
                  </h1>
                  <p className="text-slate-400 text-sm sm:text-lg lg:text-xl font-light max-w-md mx-auto px-4">
                    Seu assistente robô de segurança cibernética
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-8">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-2 sm:gap-6 max-w-4xl mx-auto">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-slate-700/50 backdrop-blur-sm">
                      {message.sender === "user" ? (
                        <User className="w-3 h-3 sm:w-5 sm:h-5 text-slate-300" />
                      ) : (
                        <CysecRobot size="sm" animated={false} />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 sm:space-y-3 min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-slate-400">
                        {message.sender === "user" ? "Você" : "Cysec"}
                      </div>
                      <div className="text-slate-100 leading-relaxed text-sm sm:text-base break-words">
                        {message.sender === "bot" ? (
                          <ReactMarkdown className="prose prose-invert prose-sm sm:prose-base max-w-none">
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2 sm:gap-6 max-w-4xl mx-auto">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-slate-700/50 backdrop-blur-sm">
                      <CysecRobot size="sm" animated={true} />
                    </div>
                    <div className="flex-1 space-y-1 sm:space-y-3">
                      <div className="text-xs sm:text-sm font-medium text-slate-400">Cysec</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 p-3 sm:p-4 lg:pb-6 bg-gradient-to-t from-slate-900/50 to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-slate-800/50 rounded-2xl sm:rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-sm">
              <Input
                ref={inputRef}
                placeholder="Pergunte alguma coisa..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="bg-transparent border-0 text-white placeholder-slate-400 text-sm sm:text-base py-3 sm:py-6 px-3 sm:px-6 pr-20 sm:pr-32 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl sm:rounded-3xl resize-none"
              />

              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-7 w-7 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl transition-all duration-200 hidden sm:flex"
                >
                  <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-7 w-7 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl transition-all duration-200 hidden lg:flex"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 h-8 w-8 sm:h-10 sm:w-10 disabled:bg-slate-600 disabled:text-slate-400 rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg"
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
