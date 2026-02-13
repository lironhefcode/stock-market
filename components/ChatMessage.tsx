"use client"

import { Bot, User, Copy, Check } from "lucide-react"
import { useState, useCallback, useMemo } from "react"
import DOMPurify from "dompurify"
import { marked } from "marked"
/** Converts basic markdown to HTML for AI responses */

function ChatMessage({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])
  const raw = marked.parse(message.content)
  const formattedContent = DOMPurify.sanitize(raw as string)

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-teal-600" : "bg-yellow-500"}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-gray-900" />}
      </div>

      {/* Message Bubble */}
      <div className={`group relative max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser ? "bg-teal-600 text-white rounded-br-md" : "bg-gray-700 text-gray-300 rounded-bl-md border border-gray-600"
          }`}
        >
          {!message.content ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            </span>
          ) : isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <div
              className="chat-markdown [&_strong]:font-semibold [&_strong]:text-gray-100 [&_em]:italic [&_p]:mb-0 [&_li]:text-gray-300"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          )}
        </div>

        {/* Copy button for assistant messages */}
        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
