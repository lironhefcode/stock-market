import { getUserWatchlist } from "@/lib/actions/watchlist.actions"
import { getStockMetrics, searchStocks, getNews } from "@/lib/actions/finnhub.actions"
import { getUserActiveAlerts } from "@/lib/actions/alert.actions"

import WatchlistClient from "@/components/WatchlistClient"

const WatchlistPage = async () => {
  const watchlistItems = await getUserWatchlist()

  const [{ quotes, profiles, metrics }, news, initialStocks, activeAlerts] = await Promise.all([
    getStockMetrics(watchlistItems),
    getNews(watchlistItems),
    searchStocks(),
    getUserActiveAlerts(),
  ])

  return (
    <section className="watchlist">
      <WatchlistClient
        watchlistItems={watchlistItems}
        initialStocks={initialStocks}
        quotes={quotes}
        profiles={profiles}
        metrics={metrics}
        news={news}
        activeAlerts={activeAlerts}
      />
    </section>
  )
}

export default WatchlistPage
