"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { CysecRobot } from "@/components/cysec-robot"
import { useTheme } from "@/components/theme-provider"
import "./globals.css"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function CysecChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [situation, setSituation] = useState("")
  const [loading, setLoading] = useState(false)
  const [userScrolled, setUserScrolled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  const scrollToBottom = () => {
    if (!userScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (messages.length > 0 && !userScrolled) {
      const timer = setTimeout(scrollToBottom, 100)
      return () => clearTimeout(timer)
    }
  }, [messages, userScrolled])

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setUserScrolled(!isNearBottom)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = { role: "user", content: inputMessage }
    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")
    setLoading(true)
    setUserScrolled(false)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          situation,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        const assistantMessage: Message = { role: "assistant", content: data.message }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = { role: "assistant", content: `Erro: ${data.error}` }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (err: any) {
      const errorMessage: Message = { role: "assistant", content: `Erro de conexão: ${err.message}` }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="safe-area-inset-top border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 safe-area-inset-x">
          <div className="flex items-center gap-3">
            <CysecRobot size="sm" className="text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Cysec</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Toggle Theme Button */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="theme-toggle p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Context Input */}
            <div className="hidden md:flex items-center gap-2 max-w-xs">
              <input
                type="text"
                placeholder="Contexto situacional..."
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                className="px-3 py-1.5 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Mobile Context Input */}
        <div className="md:hidden px-4 pb-3 safe-area-inset-x">
          <input
            type="text"
            placeholder="Contexto situacional..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </header>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 safe-area-inset-x scrollbar-thin"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <CysecRobot size="lg" className="text-primary" />
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Olá! Sou o assistente Cysec</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Especialista em segurança cibernética. Como posso ajudá-lo hoje?
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <CysecRobot size="sm" animated={loading && index === messages.length - 1} />
                  </div>
                )}

                <div
                  className={`message-bubble max-w-[85%] md:max-w-[70%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-card text-card-foreground border border-border"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-card-foreground prose-p:text-card-foreground prose-strong:text-card-foreground prose-code:text-accent prose-pre:bg-muted prose-pre:text-muted-foreground">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <CysecRobot size="sm" animated={true} />
                </div>
                <div className="bg-card text-card-foreground border border-border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm safe-area-inset-bottom">
        <div className="p-4 safe-area-inset-x">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre segurança cibernética..."
                className="input-glow w-full px-4 py-3 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground min-h-[44px] max-h-32 transition-all duration-300"
                rows={1}
                style={{
                  height: "auto",
                  minHeight: "44px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = Math.min(target.scrollHeight, 128) + "px"
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors touch-feedback min-h-[44px] min-w-[44px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
