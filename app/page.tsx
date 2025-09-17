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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <CysecRobot size="sm" className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Cysec</h1>
              <p className="text-xs text-muted-foreground">Assistente de Segurança</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="theme-toggle p-2.5 rounded-xl bg-card hover:bg-muted transition-all duration-200 border border-border/50"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <div className="hidden md:block">
              <input
                type="text"
                placeholder="Contexto..."
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                className="px-3 py-2 text-sm bg-card border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground placeholder:text-muted-foreground w-40 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <div className="md:hidden max-w-4xl mx-auto px-4 pb-3">
          <input
            type="text"
            placeholder="Contexto situacional..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-card border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground placeholder:text-muted-foreground transition-all duration-200"
          />
        </div>
      </header>

      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <CysecRobot size="lg" className="text-primary" />
              </div>
              <div className="space-y-3 max-w-md">
                <h2 className="text-3xl font-bold text-foreground">Olá! Sou o Cysec</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Seu assistente especializado em segurança cibernética. Como posso ajudá-lo hoje?
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                <div className="p-4 rounded-xl bg-card border border-border/50 text-left">
                  <h3 className="font-medium text-foreground mb-1">Análise de Vulnerabilidades</h3>
                  <p className="text-sm text-muted-foreground">Identifique e corrija falhas de segurança</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50 text-left">
                  <h3 className="font-medium text-foreground mb-1">Proteção de Dados</h3>
                  <p className="text-sm text-muted-foreground">Estratégias para proteger informações</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <CysecRobot size="sm" animated={loading && index === messages.length - 1} />
                      </div>
                    </div>
                  )}

                  <div
                    className={`message-bubble max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-card-foreground prose-p:text-card-foreground prose-strong:text-card-foreground prose-code:text-accent prose-pre:bg-muted prose-pre:text-muted-foreground prose-p:leading-relaxed">
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <CysecRobot size="sm" animated={true} />
                    </div>
                  </div>
                  <div className="bg-card text-card-foreground rounded-2xl px-5 py-4 border border-border/50">
                    <div className="flex items-center gap-3">
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
                      <span className="text-sm text-muted-foreground">Analisando...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre segurança cibernética..."
                className="input-glow w-full px-4 py-3 bg-card border border-border/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 text-foreground placeholder:text-muted-foreground min-h-[52px] max-h-32 transition-all duration-200"
                rows={1}
                style={{
                  height: "auto",
                  minHeight: "52px",
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
              className="px-4 py-3 bg-primary text-primary-foreground rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all duration-200 touch-feedback min-h-[52px] min-w-[52px] flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
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
