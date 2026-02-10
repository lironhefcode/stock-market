import { getCurrentUserPositions, getGroupMembers } from "@/lib/actions/group.actions"
import GroupHeader from "@/components/Groupheader"
import LeaderBoard from "@/components/LeaderBoard"
type GroupPageProps = {
  params: Promise<{ groupId: string }>
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

  return (
    <section className="relative pb-16">
      <GroupHeader
        groupId={groupId}
        name={result.data.group.name}
        inviteCode={result.data.group.inviteCode}
        members={members.length}
        totalGroupInvestment={totalGroupInvestment}
        positions={positions.data}
      />
      {!hasMembers ? (
        /* ── Empty State ─────────────────────────── */
        <div className="py-24 text-center">
          <p className="text-8xl font-black text-gray-800 mb-4">0</p>
          <p className="text-lg text-gray-500">No members yet. Share the invite code.</p>
        </div>
      ) : (
        <LeaderBoard members={members} />
      )}
    </section>
  )
}

export default GroupPage
