"use client"

import { useState } from "react"
import UpdatePositionsDialog from "@/components/UpdatePositionsDialog"
import { Settings } from "lucide-react"

interface UpdatePositionsButtonProps {
  initialStocks?: StockWithWatchlistStatus[]
  positions: StockPosition[]
}

const UpdatePositionsButton = ({ initialStocks = [], positions }: UpdatePositionsButtonProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-3 px-5 py-3 bg-gray-800 border border-gray-600 rounded-lg hover:border-yellow-400 transition-colors duration-150 cursor-pointer"
      >
        <Settings className="w-4 h-4 text-gray-500 group-hover:text-yellow-400 transition-colors duration-150" />
        <span className="text-sm font-mono font-bold text-gray-400 uppercase tracking-wider group-hover:text-yellow-400 transition-colors duration-150">
          Edit Positions
        </span>
      </button>

      <UpdatePositionsDialog
        open={open}
        onOpenChange={setOpen}
        currentPositions={positions}
        initialStocks={initialStocks}
      />
    </>
  )
}

export default UpdatePositionsButton
