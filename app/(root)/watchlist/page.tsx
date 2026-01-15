import { getUserWatchlist, getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions"
import { getStockMetrics, searchStocks, getNews } from "@/lib/actions/finnhub.actions"

import WatchlistTable from "@/components/WatchlistTable"
import WatchlistNews from "@/components/WatchlistNews"

import SearchCommand from "@/components/SearchCommand"
import { Suspense } from "react"

const WatchlistPage = async () => {
  const watchlistItems = await getUserWatchlist()

  return (
    <section className="watchlist">
      <div className="container mx-auto px-4 py-8">
        <div className=" flex  justify-between">
          <h1 className="watchlist-title mb-8">My Watchlist</h1>
          <Suspense>
            <SearchCommandWrapper watchlistItems={watchlistItems} />
          </Suspense>
        </div>
        <Suspense>
          <WatchlistTableWrapper watchlistItems={watchlistItems} />
        </Suspense>
        <NewsWarrper watchlistItems={watchlistItems} />
      </div>
    </section>
  )
}

export default WatchlistPage

const WatchlistTableWrapper = async ({ watchlistItems }: { watchlistItems: string[] }) => {
  const { quotes, profiles, metrics } = await getStockMetrics(watchlistItems)

  return <WatchlistTable watchlistItems={watchlistItems} quotes={quotes} profiles={profiles} metrics={metrics} />
}
const NewsWarrper = async ({ watchlistItems }: { watchlistItems: string[] }) => {
  const news = await getNews(watchlistItems)
  return <WatchlistNews news={news} />
}
const SearchCommandWrapper = async ({ watchlistItems }: { watchlistItems: string[] }) => {
  const initialStocks = await searchStocks()

  return <SearchCommand renderAs="button" initialStocks={initialStocks} watchlistSymbols={watchlistItems} />
}
