"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

import GroupForm from "./forms/group/GroupForm"
;("@/components/CreateGroupForm")

interface JoinGroupProps {
  initialStocks: StockWithWatchlistStatus[]
}

const JoinGroup = ({ initialStocks }: JoinGroupProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6 shadow-xl hover:border-gray-700 transition-all">
      <h2 className="text-2xl font-bold text-white">Join with code</h2>
      <p className="mt-3 text-sm text-gray-400 leading-relaxed">
        Enter an invite code, add your stocks and amounts invested, and we&apos;ll track your daily gains on the
        leaderboard.
      </p>

      <GroupForm
        mode="join"
        initialStocks={initialStocks}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trigger={
          <Button className="mt-6 w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg transition-all" variant="secondary">
            Open join form
          </Button>
        }
      />
    </div>
  )
}

export default JoinGroup
