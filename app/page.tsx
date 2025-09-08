"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Shield, Send, Settings, AlertTriangle, Save, Eye, EyeOff, User, Plus, Paperclip, Mic } from "lucide-react"
import { CysecRobot } from "@/components/cysec-robot"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
}

interface ChatConfig {
  apiKey: string
  systemPrompt: string
  model: string
}

// === ALTERAÇÃO: chave e modelo hardcoded ===
// Substitua a string abaixo pela sua API key real se quiser testar localmente.
const DEFAULT_CONFIG: ChatConfig = {
  apiKey: "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", // <<-- COLE AQUI (somente para testes locais!)
  systemPrompt: `Você é o Cysec, um assistente especializado em segurança cibernética. 
Você ajuda empresas e indivíduos a entender e resolver questões de segurança digital.

Suas especialidades incluem:
- Análise de vulnerabilidades
- Prevenção de ataques cibernéticos
- Políticas de segurança
- Compliance e regulamentações
- Resposta a incidentes
- Educação em segurança

Sempre forneça respostas práticas, claras e baseadas nas melhores práticas de segurança.
Quando necessário, sugira ações específicas e medidas preventivas.`,
  model: "deepseek/deepseek-chat-v3.1:free", // <<-- modelo hardcoded (troque se quiser outro)
}

export default function CysecChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [situation, setSituation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState<ChatConfig>(DEFAULT_CONFIG)
  const [tempConfig, setTempConfig] = useState<ChatConfig>(DEFAULT_CONFIG)
  const [showApiKey, setShowApiKey] = useState(false)

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

  useEffect(() => {
    const savedConfig = localStorage.getItem("cysec-config")
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
        setTempConfig(parsedConfig)
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
      }
    } else {
      // se não houver configuração salva, usa a DEFAULT_CONFIG hardcoded
      setConfig(DEFAULT_CONFIG)
      setTempConfig(DEFAULT_CONFIG)
    }
  }, [])

  const saveConfig = () => {
    if (!tempConfig.apiKey.trim()) {
      alert("API Key é obrigatória!")
      return
    }
    setConfig(tempConfig)
    localStorage.setItem("cysec-config", JSON.stringify(tempConfig))
    setShowConfig(false)
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    if (!config.apiKey.trim()) {
      alert("Configure sua API Key nas configurações antes de enviar mensagens!")
      setShowConfig(true)
      return
    }

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
        // envia a config (incluindo apiKey/model) para a rota server
        body: JSON.stringify({
          message: inputMessage,
          situation: situation,
          config: config,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          sender: "bot",
          timestamp: data.timestamp,
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error(data.error || "Erro na comunicação")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Desculpe, ocorreu um erro. Verifique suas configurações e tente novamente.",
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
    <div className="h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white flex flex-col">
      <header className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-md flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={newChat}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Nova conversa</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span className="font-bold text-lg sm:text-xl text-white">Cysec</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {!config.apiKey && (
                <Badge
                  variant="destructive"
                  className="text-xs bg-red-500/20 text-red-300 border-red-500/30 hidden sm:flex"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Não configurado
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Container principal com scroll estilizado */}
      <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full flex-1 flex flex-col">
          {showConfig && (
            <Card className="mt-4 sm:mt-8 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Configurações</h3>

                <div className="space-y-3">
                  <Label className="text-slate-300 font-medium text-sm sm:text-base">API Key OpenAI</Label>
                  <div className="flex gap-2 sm:gap-3">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={tempConfig.apiKey}
                      onChange={(e) => setTempConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl flex-shrink-0"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300 font-medium text-sm sm:text-base">Modelo</Label>
                  <Input
                    value={tempConfig.model}
                    onChange={(e) => setTempConfig((prev) => ({ ...prev, model: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300 font-medium text-sm sm:text-base">Contexto da Situação</Label>
                  <Textarea
                    placeholder="Descreva sua situação de segurança..."
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 min-h-[80px] sm:min-h-[100px] rounded-xl focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Button
                    onClick={saveConfig}
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowConfig(false)}
                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl px-6 text-sm sm:text-base"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex-1 flex flex-col min-h-0">
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto py-6 sm:py-12 scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-slate-800">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="mb-8 sm:mb-12">
                    <div className="mb-6 sm:mb-8">
                      <CysecRobot size="lg" animated={true} className="mx-auto" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Cysec
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg lg:text-xl font-light max-w-md mx-auto">
                      Seu assistente robô de segurança cibernética
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3 sm:gap-6 max-w-4xl mx-auto">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-slate-700/50 backdrop-blur-sm">
                        {message.sender === "user" ? (
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                        ) : (
                          <CysecRobot size="sm" animated={false} />
                        )}
                      </div>
                      <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-slate-400">
                          {message.sender === "user" ? "Você" : "Cysec"}
                        </div>
                        <div className="text-slate-100 leading-relaxed text-sm sm:text-base">
                          {message.sender === "bot" ? (
                            <ReactMarkdown className="prose prose-invert prose-slate max-w-none prose-sm sm:prose-base prose-headings:text-slate-200 prose-p:text-slate-100 prose-strong:text-white prose-code:text-cyan-300 prose-code:bg-slate-800/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-800/50 prose-pre:border prose-pre:border-slate-700/50 prose-pre:text-sm">
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="whitespace-pre-wrap break-words">{message.content}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 sm:gap-6 max-w-4xl mx-auto">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-slate-700/50 backdrop-blur-sm">
                        <CysecRobot size="sm" animated={true} />
                      </div>
                      <div className="flex-1 space-y-2 sm:space-y-3">
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

            <div className="flex-shrink-0 pb-4 sm:pb-6">
              <div className="max-w-4xl mx-auto">
                <div className="relative bg-slate-800/50 rounded-2xl sm:rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-sm">
                  <Input
                    ref={inputRef}
                    placeholder="Pergunte alguma coisa..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading || !config.apiKey}
                    className="bg-transparent border-0 text-white placeholder-slate-400 text-sm sm:text-base py-4 sm:py-6 px-4 sm:px-6 pr-24 sm:pr-32 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl sm:rounded-3xl"
                  />

                  <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl transition-all duration-200"
                    >
                      <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl transition-all duration-200 hidden sm:flex"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !inputMessage.trim() || !config.apiKey}
                      size="icon"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 h-8 w-8 sm:h-10 sm:w-10 disabled:bg-slate-600 disabled:text-slate-400 rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg"
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>

                {!config.apiKey && (
                  <p className="text-center text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4 px-4">
                    Configure sua API Key nas configurações para começar
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
