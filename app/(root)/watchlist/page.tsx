import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions"
import { getStockMetrics, searchStocks, getNews } from "@/lib/actions/finnhub.actions"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"
import WatchlistTable from "@/components/WatchlistTable"
import WatchlistNews from "@/components/WatchlistNews"

import { redirect } from "next/navigation"

import SearchCommand from "@/components/SearchCommand"

const WatchlistPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.email) {
    redirect("/")
  }

  const watchlistData = await getWatchlistSymbolsByEmail(session.user.email)
  const watchlistItems = watchlistData as string[]
  const initialStocks = await searchStocks()
  const { quotes, profiles, metrics } = await getStockMetrics(watchlistItems)
  const news = await getNews(watchlistItems)

  return (
    <section className="watchlist">
      <div className="container mx-auto px-4 py-8">
        <div className=" flex  justify-between">
          <h1 className="watchlist-title mb-8">My Watchlist</h1>

          <SearchCommand renderAs="button" initialStocks={initialStocks} watchlistSymbols={watchlistItems} />
        </div>

        <WatchlistTable watchlistItems={watchlistItems} quotes={quotes} profiles={profiles} metrics={metrics} />
        <WatchlistNews news={news} />
      </div>
    </section>
  )
}

export default WatchlistPage
