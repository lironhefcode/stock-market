export const dynamic = "force-dynamic"
import TradingViewWidget from "@/components/TradingViewWidget"
import { Button } from "@/components/ui/button"
import StockChatButton from "@/components/StockChatButton"
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
} from "@/lib/constants"

interface SymbolPageProps {
  params: Promise<{ symbol: string }>
}

const SymbolPage = async ({ params }: SymbolPageProps) => {
  const { symbol } = await params
  const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-"

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-1">{symbol.toUpperCase()}</h1>
            <p className="text-sm text-gray-500">Real-time market data and analysis</p>
          </div>
          <Button className="yellow-btn w-full sm:w-auto px-6">Add to watchlist</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full">
        {/* Left Column - Main Charts */}
        <section className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
          {/* Symbol Info Widget */}
          <div className="bg-gray-800 border border-gray-600 rounded-xl overflow-hidden p-3 md:p-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-100 mb-3">Market Overview</h2>
            <TradingViewWidget
              config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
              scriptUrl={scriptUrl + "symbol-info.js"}
              title={`${symbol.toUpperCase()} Overview`}
              height={170}
              className="custom-chart"
            />
          </div>

          {/* Candle Chart Widget */}
          <div className="bg-gray-800 border border-gray-600 rounded-xl overflow-hidden p-3 md:p-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-100 mb-3">Price Chart</h2>
            <TradingViewWidget className="custom-chart" config={CANDLE_CHART_WIDGET_CONFIG(symbol)} scriptUrl={scriptUrl + "advanced-chart.js"} height={400} />
          </div>

          {/* Baseline Chart Widget */}
          <div className="bg-gray-800 border border-gray-600 rounded-xl overflow-hidden p-3 md:p-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-100 mb-3">Performance Overview</h2>
            <TradingViewWidget className="custom-chart" config={BASELINE_WIDGET_CONFIG(symbol)} scriptUrl={scriptUrl + "advanced-chart.js"} height={400} />
          </div>
        </section>

        {/* Right Column - Analysis & Info */}
        <section className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
          {/* Technical Analysis Widget */}
          <div className="bg-gray-800 border border-gray-600 rounded-xl overflow-hidden p-3 md:p-4 hover:border-gray-500 transition-colors">
            <h2 className="text-base md:text-lg font-semibold text-gray-100 mb-3">Technical Analysis</h2>
            <TradingViewWidget
              config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
              scriptUrl={scriptUrl + "technical-analysis.js"}
              height={400}
              className="custom-chart"
            />
          </div>

          {/* Company Profile Widget */}
          <div className="bg-gray-800 border border-gray-600 rounded-xl overflow-hidden p-3 md:p-4 hover:border-gray-500 transition-colors">
            <h2 className="text-base md:text-lg font-semibold text-gray-100 mb-3">Company Profile</h2>
            <TradingViewWidget
              config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
              scriptUrl={scriptUrl + "symbol-profile.js"}
              height={440}
              className="custom-chart"
            />
          </div>

          {/* Company Financials Widget */}
          <div className="bg-gray-800 border border-gray-600 rounded-xl overflow-hidden p-3 md:p-4 hover:border-gray-500 transition-colors">
            <h2 className="text-base md:text-lg font-semibold text-gray-100 mb-3">Financial Data</h2>
            <TradingViewWidget
              config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
              scriptUrl={scriptUrl + "financials.js"}
              height={464}
              className="custom-chart"
            />
          </div>
        </section>
      </div>

      {/* AI Chat Floating Button */}
      <StockChatButton symbol={symbol} />
    </div>
  )
}

export default SymbolPage
