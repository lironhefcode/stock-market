"use client"

import { Bot, User, Copy, Check } from "lucide-react"
import { useState, useCallback, useMemo } from "react"

/** Converts basic markdown to HTML for AI responses */
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML entities
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

  // Italic: *text* (but not inside already-processed bold tags)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")

  // Split into lines to handle block-level elements
  const lines = html.split("\n")
  const result: string[] = []
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Bullet list: - item or * item
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/)
    if (bulletMatch) {
      if (!inList) {
        result.push('<ul class="list-disc pl-4 my-1 space-y-0.5">')
        inList = true
      }
      result.push(`<li>${bulletMatch[1]}</li>`)
      continue
    }

    // Numbered list: 1. item
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)/)
    if (numberedMatch) {
      if (!inList) {
        result.push('<ul class="list-decimal pl-4 my-1 space-y-0.5">')
        inList = true
      }
      result.push(`<li>${numberedMatch[1]}</li>`)
      continue
    }

    // Close any open list
    if (inList) {
      result.push("</ul>")
      inList = false
    }

    // Empty line = paragraph break
    if (trimmed === "") {
      result.push('<div class="h-2"></div>')
    } else {
      result.push(`<p>${trimmed}</p>`)
    }
  }

  if (inList) result.push("</ul>")

  return result.join("")
}

function ChatMessage({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  const formattedContent = useMemo(() => {
    if (isUser || !message.content) return ""
    return renderMarkdown(message.content)
  }, [isUser, message.content])

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
