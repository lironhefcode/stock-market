"use client"

import { leaveGroup } from "@/lib/actions/group.actions"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

function LeaveGroupBtn({ groupId }: { groupId: string }) {
  const router = useRouter()
  const onLeaveGroup = async () => {
    const leaveResult = await leaveGroup(groupId)
    if (!leaveResult.success) {
      toast.error(leaveResult.error || "Failed to leave group")
    } else {
      toast.success("Left group successfully")
      router.push("/groups")
    }
  }
  return (
    <Button
      className="group flex items-center justify-start gap-3 px-5 py-3 bg-gray-800 border border-red-500/50 rounded-lg hover:border-red-500 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer w-full sm:w-auto"
      onClick={onLeaveGroup}
    >
      <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors duration-150" />
      <span className="text-sm font-mono font-bold text-red-400 uppercase tracking-wider">Leave Group</span>
    </Button>
  )
}

export default LeaveGroupBtn
