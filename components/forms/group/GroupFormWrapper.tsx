"use client"
import { useState } from "react"
import GroupForm from "./GroupForm"
import { Button } from "../../ui/button"
import { useSearchParams } from "next/navigation"

type test = {
  initialStocks: StockWithWatchlistStatus[]
  title: string
  description: string
  inviteCode?: string
  mode: "create" | "join"
}

const GroupFormWrapper = ({ initialStocks, mode, title, description, inviteCode }: test) => {
  const [dialogOpen, setDialogOpen] = useState(inviteCode ? true : false)
  const isCreate = mode === "create"
  const titleClass = isCreate ? "h-1 bg-yellow-400" : "h-1 bg-teal-400"
  const wrapperHoverClass = isCreate ? "hover:border-yellow-400/60" : "hover:border-teal-400/60"
  const submitBtnClass = isCreate
    ? "mt-8 w-full md:w-auto bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold"
    : "mt-8 w-full md:w-auto bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-lg transition-all"
  return (
    <div className={`h-full bg-gray-800 border border-gray-600 rounded-lg overflow-hidden transition-colors duration-150 ${wrapperHoverClass}`}>
      <div className={titleClass} />
      <div className="p-6 flex h-full flex-col">
        <p className={"text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-3"}>{isCreate ? "New League" : "Enter Existing"}</p>
        <h2 className="text-3xl font-black text-gray-400 tracking-tight">{title}</h2>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">{description}</p>

        <GroupForm
          inviteCode={inviteCode}
          mode={mode}
          initialStocks={initialStocks}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          trigger={
            <Button className={submitBtnClass} variant="secondary">
              {isCreate ? "Create group" : "Join group"}
            </Button>
          }
        />
      </div>
    </div>
  )
}
export default GroupFormWrapper
