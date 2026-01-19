import { searchStocks } from "@/lib/actions/finnhub.actions"
import Navitems from "./Navitems"
import UserDropdown from "./UserDropdown"
import { getUserWatchlist } from "@/lib/actions/watchlist.actions"
import { getSession } from "@/lib/actions/auth.actions"

export default async function HeaderData() {
  const [initialStocks, watchlistSymbols, session] = await Promise.all([
    searchStocks(),
    getUserWatchlist(),
    getSession(),
  ])

  const { user } = session.session!
  return (
    <>
      <nav className="hidden sm:block">
        <Navitems watchlistSymbols={watchlistSymbols} initialStocks={initialStocks} />
      </nav>
      <UserDropdown watchlistSymbols={watchlistSymbols} user={user} initialStocks={initialStocks} />
    </>
  )
}
