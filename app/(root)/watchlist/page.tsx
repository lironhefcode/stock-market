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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-400 mb-1">My Watchlist</h1>
            <p className="text-sm text-gray-500">Track your favorite stocks in real-time</p>
          </div>
          <Suspense>
            <SearchCommandWrapper watchlistItems={watchlistItems} />
          </Suspense>
        </div>
        <Suspense>
          <WatchlistTableWrapper watchlistItems={watchlistItems} />
        </Suspense>
        <div className="mt-12">
          <NewsWarrper watchlistItems={watchlistItems} />
        </div>
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
