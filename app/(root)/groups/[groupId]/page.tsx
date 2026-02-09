import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCurrentUserPositions, getGroupMembers, leaveGroup } from "@/lib/actions/group.actions"
import { TrendingUp, TrendingDown, ChevronRight, Copy } from "lucide-react"
import UpdatePositionsButton from "@/components/UpdatePositionsButton"
import { redirect } from "next/navigation"
import LeaveGroupBtn from "@/components/LeaveGroupBtn"

type GroupPageProps = {
  params: Promise<{ groupId: string }>
}

const formatTodayGain = (gain: number) => {
  if (!Number.isFinite(gain)) return "0.00%"
  const sign = gain >= 0 ? "+" : ""
  return `${sign}${gain.toFixed(2)}%`
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const getInitials = (username: string) => {
  return username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const GroupPage = async ({ params }: GroupPageProps) => {
  const { groupId } = await params
  const result = await getGroupMembers(groupId)
  const positions = await getCurrentUserPositions()

  if (!positions.success) {
    return (
      <section className="py-20">
        <div className="border-l-4 border-red-500 pl-6">
          <h1 className="text-3xl font-bold text-gray-400 mb-2">Error</h1>
          <p className="text-red-500 font-mono text-sm">{positions.error}</p>
        </div>
      </section>
    )
  }

  if (!result.success) {
    return (
      <section className="py-20">
        <div className="border-l-4 border-red-500 pl-6">
          <h1 className="text-3xl font-bold text-gray-400 mb-2">Error</h1>
          <p className="text-red-500 font-mono text-sm">{result.error}</p>
        </div>
      </section>
    )
  }

  const members = result.data.members || []
  const hasMembers = members.length > 0
  const totalGroupInvestment = members.reduce((sum, m) => sum + m.totalInvested, 0)
  const leader = members[0]
  const rest = members.slice(1)

  return (
    <section className="relative pb-16">
      {/* ── Header ─────────────────────────────────── */}
      <div className="border-b border-gray-700 pb-8 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-3">Group #{groupId.slice(-6).toUpperCase()}</p>
            <h1 className="text-5xl md:text-7xl font-black text-gray-400 tracking-tighter leading-none mb-4">{result.data.group.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded">
                <span className="text-xs font-mono text-gray-500 uppercase">Invite</span>
                <span className="font-mono text-lg font-bold text-yellow-400 tracking-widest">{result.data.group.inviteCode}</span>
                <Copy className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <span className="text-gray-600">·</span>
              <span className="text-sm text-gray-500 font-mono">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-600">·</span>
              <span className="text-sm text-gray-500 font-mono">{formatCurrency(totalGroupInvestment)} total</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UpdatePositionsButton positions={positions.data} />
            <LeaveGroupBtn groupId={groupId} />
          </div>
        </div>
      </div>

      {!hasMembers ? (
        /* ── Empty State ─────────────────────────── */
        <div className="py-24 text-center">
          <p className="text-8xl font-black text-gray-800 mb-4">0</p>
          <p className="text-lg text-gray-500">No members yet. Share the invite code.</p>
        </div>
      ) : (
        <>
          {/* ── Leader Spotlight ──────────────────── */}
          {leader && (
            <div className="relative mb-12">
              <div className="absolute -top-4 -left-2 text-[12rem] md:text-[16rem] font-black text-gray-800/60 leading-none select-none pointer-events-none z-0">
                1
              </div>

              <div className="relative z-10 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
                {/* Yellow accent strip on top */}
                <div className="h-1 bg-yellow-400" />

                <div className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                    {/* Leader identity */}
                    <div className="flex items-center gap-5">
                      <Avatar className="w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 border-yellow-400/40">
                        <AvatarFallback className="bg-yellow-400/10 text-yellow-400 font-bold text-2xl rounded-lg">
                          {getInitials(leader.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-mono text-yellow-400 uppercase tracking-widest mb-1">Leading</p>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-400 tracking-tight">{leader.username}</h2>
                      </div>
                    </div>

                    {/* Leader metrics - data grid */}
                    <div className="flex-1 grid grid-cols-3 gap-px bg-gray-700 rounded-lg overflow-hidden md:ml-auto md:max-w-lg">
                      <div className="bg-gray-800 p-5">
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Today</p>
                        <div
                          className={`flex items-center gap-1.5 text-2xl font-black tabular-nums ${leader.todayGain >= 0 ? "text-teal-400" : "text-red-500"}`}
                        >
                          {leader.todayGain >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          {formatTodayGain(leader.todayGain)}
                        </div>
                      </div>
                      <div className="bg-gray-800 p-5">
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Invested</p>
                        <p className="text-2xl font-black text-gray-400 tabular-nums">{formatCurrency(leader.totalInvested)}</p>
                      </div>
                      <div className="bg-gray-800 p-5">
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Holdings</p>
                        <p className="text-2xl font-black text-gray-400 tabular-nums">{leader.positions.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Rankings Table ────────────────────── */}
          {rest.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-5">
                <h3 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">Rankings</h3>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-700 text-xs font-mono text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Trader</div>
                  <div className="col-span-3 text-right">Daily P&L</div>
                  <div className="col-span-2 text-right">Capital</div>
                  <div className="col-span-2 text-right">Positions</div>
                </div>

                {/* Rows */}
                {rest.map((member, i) => {
                  const rank = i + 2
                  const isPositive = member.todayGain >= 0

                  return (
                    <div
                      key={member.id || member.userId}
                      className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-5 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-colors duration-150"
                      style={{
                        animation: "slideInUp 0.4s ease-out both",
                        animationDelay: `${i * 60}ms`,
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
                        <Avatar className="w-10 h-10 rounded-lg border border-gray-600">
                          <AvatarFallback className="bg-gray-700 text-gray-400 font-bold text-sm rounded-lg">{getInitials(member.username)}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-gray-400 text-lg truncate">{member.username}</span>
                      </div>

                      {/* Daily P&L */}
                      <div className="col-span-3 flex items-center gap-2 justify-start md:justify-end">
                        {isPositive ? <TrendingUp className="w-4 h-4 text-teal-400" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                        <span className={`font-mono font-bold text-lg tabular-nums ${isPositive ? "text-teal-400" : "text-red-500"}`}>
                          {formatTodayGain(member.todayGain)}
                        </span>
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
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default GroupPage
