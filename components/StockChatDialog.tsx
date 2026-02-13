"use client"

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react"
import { X, Send, Trash2, Square, TrendingUp } from "lucide-react"
import { useStockChat } from "@/hooks/useStockChat"
import ChatMessage from "@/components/ChatMessage"

function StockChatDialog({ symbol, open, onClose }: { symbol: string; open: boolean; onClose: () => void }) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { messages, isLoading, sendMessage, clearChat, stopGenerating } = useStockChat(symbol)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Chat Panel */}
      <div className="relative z-10 w-full max-w-md h-[min(600px,80vh)] bg-gray-800 border border-gray-600 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-600 bg-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-100">AI Stock Advisor</h3>
              <p className="text-xs text-gray-400">{symbol.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide-default">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-yellow-500" />
              </div>
              <h4 className="text-base font-semibold text-gray-200 mb-2">Ask about {symbol.toUpperCase()}</h4>
              <p className="text-sm text-gray-500 mb-6">Get AI-powered analysis and advice using real-time market data.</p>
              <div className="flex flex-col gap-2 w-full">
                {[
                  `Should I buy ${symbol.toUpperCase()} right now?`,
                  `What are the risks of investing in ${symbol.toUpperCase()}?`,
                  `Give me a technical analysis of ${symbol.toUpperCase()}`,
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="text-left text-sm text-gray-400 hover:text-gray-200 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 transition-colors cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-600 px-4 py-3 bg-gray-800">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${symbol.toUpperCase()}...`}
              disabled={isLoading}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-yellow-500 transition-colors disabled:opacity-50"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stopGenerating}
                className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors cursor-pointer"
                title="Stop generating"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 disabled:text-gray-500 text-gray-900 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
          <p className="text-[10px] text-gray-600 text-center mt-2">AI-generated advice. Not financial guidance. Always do your own research.</p>
        </div>
      </div>
    </div>
  )
}

export default StockChatDialog
