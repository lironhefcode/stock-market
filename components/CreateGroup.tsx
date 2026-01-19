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
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6 shadow-xl hover:border-gray-700 transition-all">
      <h2 className="text-2xl font-bold text-white">Create group</h2>
      <p className="mt-3 text-sm text-gray-400 leading-relaxed">
        Spin up a new group and share the invite code with friends to compare portfolio performance.
      </p>

      <GroupForm
        mode="create"
        initialStocks={initialStocks}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trigger={
          <Button className="mt-6 w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg transition-all" variant="secondary">
            Create group
          </Button>
        }
      />
    </div>
  )
}

export default CreateGroup
