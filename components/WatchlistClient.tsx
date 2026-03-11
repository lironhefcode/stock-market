"use client"

import SearchCommand from "./SearchCommand"
import WatchlistTable from "./WatchlistTable"
import WatchlistNews from "./WatchlistNews"
import AlertsList from "./AlertsList"
import useWatchList from "@/hooks/useWatchList"
import { useActiveAlerts } from "@/hooks/useAlerts"
import { Bell } from "lucide-react"

type WatchlistClientProps = {
  watchlistItems: string[]
  initialStocks: StockWithWatchlistStatus[]
  quotes: Record<string, QuoteData>
  profiles: Record<string, ProfileData>
  metrics: Record<string, FinancialsData>
  news: MarketNewsArticle[]
  activeAlerts: Alert[]
}

export default function WatchlistClient({ watchlistItems, initialStocks, quotes, profiles, metrics, news, activeAlerts }: WatchlistClientProps) {
  const { watchlist, handleWatchlistChange } = useWatchList(watchlistItems)
  const { data: alerts = [] } = useActiveAlerts(activeAlerts)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-400 mb-1">My Watchlist</h1>
          <p className="text-sm text-gray-500">Track your favorite stocks in real-time</p>
        </div>
        <SearchCommand quickAdd={true} renderAs="button" initialStocks={initialStocks} watchlistSymbols={watchlist} onWatchlistChange={handleWatchlistChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WatchlistTable watchlistItems={watchlist} quotes={quotes} profiles={profiles} metrics={metrics} />
        </div>
        <div className="watchlist-alerts flex">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-gray-300">Price Alerts</h2>
            {alerts.length > 0 && (
              <span className="ml-auto text-xs font-mono text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">
                {alerts.length}
              </span>
            )}
          </div>
          <AlertsList initialAlerts={activeAlerts} />
        </div>
      </div>

      <div className="mt-12">
        <WatchlistNews news={news} />
      </div>
    </div>
  )
}
