"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

import CreateGroupForm from "@/components/forms/group/GroupForm"
import GroupForm from "@/components/forms/group/GroupForm"

interface CreateGroupProps {
  initialStocks: StockWithWatchlistStatus[]
}

const CreateGroup = ({ initialStocks }: CreateGroupProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-white">Create group</h2>
      <p className="mt-2 text-sm text-gray-400">
        Spin up a new group and share the invite code with friends to compare portfolio performance.
      </p>

      <GroupForm
        mode="create"
        initialStocks={initialStocks}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trigger={
          <Button className="mt-4 w-full sm:w-auto " variant="secondary">
            Create group
          </Button>
        }
      />
    </div>
  )
}

export default CreateGroup
