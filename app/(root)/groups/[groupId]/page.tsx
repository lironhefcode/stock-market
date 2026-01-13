import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getGroupMembers } from "@/lib/actions/group.actions"

type GroupPageProps = {
  params: Promise<{ groupId: string }>
}

const formatTodayGain = (gain: number) => {
  if (!Number.isFinite(gain)) return "$0.00"
  const sign = gain >= 0 ? "+" : ""
  return `${sign}$${gain.toFixed(2)}`
}

const GroupPage = async ({ params }: GroupPageProps) => {
  const { groupId } = await params
  const result = await getGroupMembers(groupId)

  if (!result.success) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Group leaderboard</h1>
        <p className="text-sm text-red-400">{result.error}</p>
      </section>
    )
  }

  const members = result.data.members || []
  const hasMembers = members.length > 0

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm text-gray-400">Group ID: {groupId}</p>
        <h1 className="text-3xl font-semibold text-white">Leaderboard</h1>
        <p className="text-sm text-gray-400">Ranked by total value gained today.</p>
      </div>

      {!hasMembers ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-gray-400">
          No members have joined this group yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800/50">
                <TableHead className="text-white">Rank</TableHead>
                <TableHead className="text-white">Username</TableHead>
                <TableHead className="text-white">Today&apos;s Gain</TableHead>
                <TableHead className="text-white">Total Invested</TableHead>
                <TableHead className="text-white">Positions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member, index) => (
                <TableRow key={member.id || member.userId}>
                  <TableCell className="font-semibold text-white">{index + 1}</TableCell>
                  <TableCell className="text-gray-200">{member.username}</TableCell>
                  <TableCell className={member.todayGain >= 0 ? "text-green-400" : "text-red-400"}>
                    {formatTodayGain(member.todayGain)}
                  </TableCell>
                  <TableCell className="text-gray-300">${member.totalInvested.toFixed(2)}</TableCell>
                  <TableCell className="text-gray-300">
                    {member.positions.length} stock{member.positions.length !== 1 ? "s" : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}

export default GroupPage
