import { formatCurrency, formatTodayGain, getInitials } from "@/lib/utils"
import { Crown, TrendingDown, TrendingUp } from "lucide-react"
import { Avatar, AvatarFallback } from "./ui/avatar"

function GroupMemberRow({ member, rank }: { member: GroupMemberRow; rank: number }) {
  const isLeader = rank === 1
  const isPositive = member.todayGain >= 0
  return (
    <div
      key={member.userId}
      className={`group grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-5 border-b last:border-b-0 transition-colors duration-150 ${
        rank === 1 ? "bg-yellow-400/5 border-yellow-400/30 hover:bg-yellow-400/10" : "border-gray-700 hover:bg-gray-700/30"
      }`}
      style={{
        animation: "slideInUp 0.4s ease-out both",
        animationDelay: `${rank * 60}ms`,
      }}
    >
      {/* Rank */}
      <div className="hidden md:flex col-span-1 items-center">
        <span className={`text-2xl font-black tabular-nums ${rank <= 3 ? "text-yellow-500" : "text-gray-600"}`}>{rank}</span>
      </div>

      {/* Trader */}
      <div className="col-span-4 flex items-center gap-4">
        {/* Mobile rank */}
        <span className="md:hidden text-xl font-black text-gray-600 tabular-nums w-8">{rank}</span>
        <Avatar className={`w-10 h-10 rounded-lg border ${isLeader ? "border-yellow-400/50" : "border-gray-600"}`}>
          <AvatarFallback className={`font-bold text-sm rounded-lg ${isLeader ? "bg-yellow-400/10 text-yellow-400" : "bg-gray-700 text-gray-400"}`}>
            {getInitials(member.username)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <span className={`font-bold text-lg truncate block ${isLeader ? "text-yellow-400" : "text-gray-400"}`}>{member.username}</span>
          {isLeader && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-yellow-400/90">
              <Crown className="w-3 h-3" />
              Leader
            </span>
          )}
        </div>
      </div>

      {/* Daily P&L */}
      <div className="col-span-3 flex items-center gap-2 justify-start md:justify-end">
        {isPositive ? <TrendingUp className="w-4 h-4 text-teal-400" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
        <span className={`font-mono font-bold text-lg tabular-nums ${isPositive ? "text-teal-400" : "text-red-500"}`}>{formatTodayGain(member.todayGain)}</span>
      </div>

      {/* Capital */}
      <div className="hidden md:block col-span-2 text-right">
        <span className="font-mono font-semibold text-gray-400 tabular-nums">{formatCurrency(member.totalInvested)}</span>
      </div>

      {/* Positions */}
      <div className="hidden md:block col-span-2 text-right">
        <span className="font-mono text-gray-500">
          {member.positions.length} stock{member.positions.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  )
}

export default GroupMemberRow
