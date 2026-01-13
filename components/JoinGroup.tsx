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
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-white">Join with code</h2>
      <p className="mt-2 text-sm text-gray-400">
        Enter an invite code, add your stocks and amounts invested, and we&apos;ll track your daily gains on the
        leaderboard.
      </p>

      <GroupForm
        mode="join"
        initialStocks={initialStocks}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trigger={
          <Button className="mt-4 w-full sm:w-auto" variant="secondary">
            Open join form
          </Button>
        }
      />
    </div>
  )
}

export default JoinGroup
