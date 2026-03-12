import { searchStocks } from "@/lib/actions/finnhub.actions"
import Navitems from "./Navitems"
import UserDropdown from "./UserDropdown"
import AlertsBell from "./AlertsBell"
import { getUserWatchlist } from "@/lib/actions/watchlist.actions"
import { getTriggeredAlerts } from "@/lib/actions/alert.actions"
import { getUser } from "@/lib/actions/auth.actions"

export default async function HeaderData() {
  const [initialStocks, watchlistSymbols, user, triggeredAlerts] = await Promise.all([
    searchStocks(),
    getUserWatchlist(),
    getUser(),
    getTriggeredAlerts(),
  ])

  return (
    <>
      <nav className="hidden sm:block">
        <Navitems watchlistSymbols={watchlistSymbols} initialStocks={initialStocks} />
      </nav>
      <div className="flex items-center gap-2">
        <AlertsBell triggeredAlerts={triggeredAlerts} />
        <UserDropdown watchlistSymbols={watchlistSymbols} user={user} initialStocks={initialStocks} />
      </div>
    </>
  )
}
