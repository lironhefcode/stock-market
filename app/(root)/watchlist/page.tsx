import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions"
import { getStockQuotes } from "@/lib/actions/finnhub.actions"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"
import WatchlistTable from "@/components/WatchlistTable"
import { WatchlistItem } from "@/db/models/watchlist"
import { redirect } from "next/navigation"

const WatchlistPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.email) {
    redirect("/")
  }

  // Get full watchlist items
  const watchlistData = await getWatchlistSymbolsByEmail(session.user.email, true)
  const watchlistItems = watchlistData as WatchlistItem[]

  // Extract symbols for quote fetching
  const symbols = watchlistItems.map((item) => item.symbol)

  // Fetch stock quotes for all symbols
  const quotes = await getStockQuotes(symbols)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="watchlist-title mb-8">My Watchlist</h1>
      <WatchlistTable watchlistItems={watchlistItems} quotes={quotes} />
    </div>
  )
}

export default WatchlistPage
