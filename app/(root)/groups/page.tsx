export const dynamic = "force-dynamic"
import GroupFormWrapper from "@/components/forms/group/GroupFormWrapper"
import { searchStocks } from "@/lib/actions/finnhub.actions"
import { getUserGroup } from "@/lib/actions/group.actions"
import { redirect } from "next/navigation"

const GroupsPage = async () => {
  const groupId = await getUserGroup()
  if (groupId) {
    redirect(`/groups/${groupId}`)
  }
  const initialStocks = await searchStocks()

  return (
    <GroupPageLayout>
      <GroupFormWrapper
        initialStocks={initialStocks}
        mode="create"
        title="Create group"
        description="Start a private leaderboard and invite friends to compare daily portfolio performance"
      />
      <GroupFormWrapper
        mode="join"
        title="Join group"
        description="Enter an invite code, add your positions, and instantly join the daily gains leaderboard."
        initialStocks={initialStocks}
      />
    </GroupPageLayout>
  )
}

const GroupPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="relative pb-16 space-y-10">
      <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
        <div className="h-1 bg-yellow-400" />
        <div className="p-6 md:p-8">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-3">Social competition</p>
          <h1 className="text-4xl md:text-6xl font-black text-gray-400 tracking-tighter leading-none mb-4">Groups</h1>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl">
            Create a private investing group or join one with an invite code to compete on daily gains.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">Get Started</h2>
        <div className="flex-1 h-px bg-gray-700" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">{children}</div>
    </section>
  )
}

export default GroupsPage
