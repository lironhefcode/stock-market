"use client"

import SearchCommand from "./SearchCommand"
import WatchlistTable from "./WatchlistTable"
import WatchlistNews from "./WatchlistNews"
import useWatchList from "@/hooks/useWatchList"

type WatchlistClientProps = {
  watchlistItems: string[]
  initialStocks: StockWithWatchlistStatus[]
  quotes: Record<string, QuoteData>
  profiles: Record<string, ProfileData>
  metrics: Record<string, FinancialsData>
  news: MarketNewsArticle[]
}

export default function WatchlistClient({ watchlistItems, initialStocks, quotes, profiles, metrics, news }: WatchlistClientProps) {
  const { watchlist, handleWatchlistChange } = useWatchList(watchlistItems)
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-400 mb-1">My Watchlist</h1>
          <p className="text-sm text-gray-500">Track your favorite stocks in real-time</p>
        </div>
        <SearchCommand quickAdd={true} renderAs="button" initialStocks={initialStocks} watchlistSymbols={watchlist} onWatchlistChange={handleWatchlistChange} />
      </div>

      <WatchlistTable watchlistItems={watchlist} quotes={quotes} profiles={profiles} metrics={metrics} />

      <div className="mt-12">
        <WatchlistNews news={news} />
      </div>
    </div>
  )
}
