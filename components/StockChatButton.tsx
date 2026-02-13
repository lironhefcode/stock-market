"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import StockChatDialog from "@/components/StockChatDialog"

function StockChatButton({ symbol }: { symbol: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 ${
          open ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        aria-label="Open AI Stock Advisor chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Dialog */}
      <StockChatDialog symbol={symbol} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default StockChatButton
