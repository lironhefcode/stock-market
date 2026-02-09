import TradingViewWidget from "@/components/TradingViewWidget"
import {
  HEATMAP_WIDGET_CONFIG,
  MARKET_DATA_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
} from "@/lib/constants"

const Home = () => {
  const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-"

  return (
    <div className="relative pb-16">
      {/* ── Header ─────────────────────────────────── */}
      <div className="border-b border-gray-700 pb-8 mb-10">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-3">
          Real-Time Terminal
        </p>
        <h1 className="text-5xl md:text-7xl font-black text-gray-400 tracking-tighter leading-none mb-4">
          Market Dashboard
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Live indices, heatmaps, market quotes and top stories — all in one view.
        </p>
      </div>

      {/* ── Market Overview ────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">
            Market Overview
          </h2>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Global Indices */}
          <div className="xl:col-span-1">
            <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
              <div className="h-1 bg-yellow-400" />
              <div className="p-5">
                <TradingViewWidget
                  config={MARKET_OVERVIEW_WIDGET_CONFIG}
                  scriptUrl={scriptUrl + "market-overview.js"}
                  title="Global Indices"
                  className="custom-chart"
                />
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="xl:col-span-2">
            <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
              <div className="h-1 bg-teal-400" />
              <div className="p-5">
                <TradingViewWidget
                  config={HEATMAP_WIDGET_CONFIG}
                  scriptUrl={scriptUrl + "stock-heatmap.js"}
                  title="Stock Heatmap"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Analytics ──────────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">
            Analytics & News
          </h2>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Top Stories */}
          <div className="xl:col-span-1">
            <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden h-full">
              <div className="h-1 bg-yellow-400" />
              <div className="p-5 h-full">
                <TradingViewWidget
                  config={TOP_STORIES_WIDGET_CONFIG}
                  scriptUrl={scriptUrl + "timeline.js"}
                  title="Top Stories"
                  className="custom-chart"
                />
              </div>
            </div>
          </div>

          {/* Market Quotes */}
          <div className="xl:col-span-2">
            <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
              <div className="h-1 bg-teal-400" />
              <div className="p-5">
                <TradingViewWidget
                  config={MARKET_DATA_WIDGET_CONFIG}
                  scriptUrl={scriptUrl + "market-quotes.js"}
                  title="Market Quotes"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
export default Home
