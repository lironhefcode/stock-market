import { searchStocks } from "@/lib/actions/finnhub.actions"
import { getUserWatchlist } from "@/lib/actions/watchlist.actions"
import { getTriggeredAlerts } from "@/lib/actions/alert.actions"
import { getUser } from "@/lib/actions/auth.actions"
import HeaderClient from "./HeaderClient"

export default async function HeaderData() {
  const [initialStocks, watchlistSymbols, user, triggeredAlerts] = await Promise.all([
    searchStocks(),
    getUserWatchlist(),
    getUser(),
    getTriggeredAlerts(),
  ])

  return (
    <HeaderClient
      initialStocks={initialStocks}
      watchlistSymbols={watchlistSymbols}
      user={user}
      triggeredAlerts={triggeredAlerts}
    />
  )
}
