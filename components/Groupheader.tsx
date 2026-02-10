import { Copy } from "lucide-react"
import WhatsappBtn from "./WhatsappBtn"
import UpdatePositionsButton from "./UpdatePositionsButton"
import LeaveGroupBtn from "./LeaveGroupBtn"
import { formatCurrency } from "@/lib/utils"

type GroupHeaderProps = {
  groupId: string
  name: string
  inviteCode: string
  members: number
  totalGroupInvestment: number
  positions: StockPosition[]
}

function GroupHeader({ groupId, name, inviteCode, members, totalGroupInvestment, positions }: GroupHeaderProps) {
  return (
    <div className="border-b border-gray-700 pb-8 mb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-3">Group #{groupId.slice(-6).toUpperCase()}</p>
          <h1 className="text-5xl md:text-7xl font-black text-gray-400 tracking-tighter leading-none mb-4">{name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded">
              <span className="text-xs font-mono text-gray-500 uppercase">Invite</span>
              <span className="font-mono text-lg font-bold text-yellow-400 tracking-widest">{inviteCode}</span>
              <Copy className="w-3.5 h-3.5 text-gray-600" />
              <WhatsappBtn inviteCode={inviteCode} />
            </div>
            <span className="text-gray-600">·</span>
            <span className="text-sm text-gray-500 font-mono">
              {members} member{members !== 1 ? "s" : ""}
            </span>
            <span className="text-gray-600">·</span>
            <span className="text-sm text-gray-500 font-mono">{formatCurrency(totalGroupInvestment)} total</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <UpdatePositionsButton positions={positions} />
          <LeaveGroupBtn groupId={groupId} />
        </div>
      </div>
    </div>
  )
}

export default GroupHeader
