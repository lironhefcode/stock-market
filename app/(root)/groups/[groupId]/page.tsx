export const dynamic = "force-dynamic"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getGroupMembers } from "@/lib/actions/group.actions"
import { TrendingUp, TrendingDown } from "lucide-react"

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
    minimumFractionDigits: 2,
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

  if (!result.success) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-400">Group leaderboard</h1>
        <p className="text-sm text-red-500">{result.error}</p>
      </section>
    )
  }

  const members = result.data.members || []
  const hasMembers = members.length > 0

  return (
    <section className="space-y-6 pb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-400">{result.data.group.name} Leaderboard</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg">
            <span className="text-sm text-gray-500">Invite Code:</span>
            <span className="text-base font-mono font-semibold text-yellow-500">{result.data.group.inviteCode}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">Ranked by total value gained today.</p>
      </div>

      {!hasMembers ? (
        <div className="rounded-lg border border-gray-600 bg-gray-800 p-8 text-center">
          <p className="text-gray-500">No members have joined this group yet.</p>
        </div>
      ) : (
        <div className="leaderboard-container">
          {members.map((member, index) => {
            const isPositive = member.todayGain >= 0
            const isTopThree = index < 3

            return (
              <div key={member.id || member.userId} className="leaderboard-card">
                {/* Rank */}
                <div className={`leaderboard-rank ${isTopThree ? "leaderboard-rank-top" : ""}`}>{index + 1}</div>

                {/* Avatar */}
                <Avatar className="leaderboard-avatar">
                  <AvatarFallback className="bg-gray-700 text-gray-400 font-semibold">
                    {getInitials(member.username)}
                  </AvatarFallback>
                </Avatar>

                {/* User Info and Stats */}
                <div className="leaderboard-info">
                  <div className="leaderboard-user">
                    <h3 className="leaderboard-name">{member.username}</h3>
                    <div className="leaderboard-stats">
                      {/* Today's Gain */}
                      <div className="leaderboard-stat">
                        <span className="leaderboard-stat-label">Today's Gain</span>
                        <div className="flex items-center gap-1">
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-teal-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={isPositive ? "leaderboard-gain-positive" : "leaderboard-gain-negative"}>
                            {formatTodayGain(member.todayGain)}
                          </span>
                        </div>
                      </div>

                      {/* Total Invested */}
                      <div className="leaderboard-stat">
                        <span className="leaderboard-stat-label">Total Invested</span>
                        <span className="leaderboard-stat-value">{formatCurrency(member.totalInvested)}</span>
                      </div>

                      {/* Positions */}
                      <div className="leaderboard-stat">
                        <span className="leaderboard-stat-label">Positions</span>
                        <span className="leaderboard-stat-value">
                          {member.positions.length} {member.positions.length !== 1 ? "stocks" : "stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default GroupPage
