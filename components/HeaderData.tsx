import { searchStocks } from "@/lib/actions/finnhub.actions"
import Navitems from "./Navitems"
import UserDropdown from "./UserDropdown"
import { getUserWatchlist } from "@/lib/actions/watchlist.actions"
import { getSession, getUser } from "@/lib/actions/auth.actions"

export default async function HeaderData() {
  const [initialStocks, watchlistSymbols, user] = await Promise.all([searchStocks(), getUserWatchlist(), getUser()])

  return (
    <>
      <nav className="hidden sm:block">
        <Navitems watchlistSymbols={watchlistSymbols} initialStocks={initialStocks} />
      </nav>
      <UserDropdown watchlistSymbols={watchlistSymbols} user={user} initialStocks={initialStocks} />
    </>
  )
}
