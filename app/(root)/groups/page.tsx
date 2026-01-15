import CreateGroup from "@/components/CreateGroup"
import JoinGroup from "@/components/JoinGroup"
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
    <section className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Social groups competition</p>
          <h1 className="text-3xl font-semibold text-white">Groups</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CreateGroup initialStocks={initialStocks} />
        <JoinGroup initialStocks={initialStocks} />
      </div>
    </section>
  )
}

export default GroupsPage
