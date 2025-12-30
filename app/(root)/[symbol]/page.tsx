import TradingViewWidget from "@/components/TradingViewWidget"
import { Button } from "@/components/ui/button"
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
    <div className="min-h-screen home-wrapper">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left Column - First Section */}
        <section className="flex flex-col gap-8">
          {/* Symbol Info Widget */}
          <div>
            <TradingViewWidget
              config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
              scriptUrl={scriptUrl + "symbol-info.js"}
              title={`${symbol.toUpperCase()} Overview`}
              height={170}
              className="custom-chart"
            />
          </div>
          {/* Candle Chart Widget */}
          <div>
            <TradingViewWidget
              className="custom-chart"
              config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
              scriptUrl={scriptUrl + "advanced-chart.js"}
              height={600}
            />
          </div>
          {/* Symbol Overview */}
          <div>
            <TradingViewWidget
              className="custom-chart"
              config={BASELINE_WIDGET_CONFIG(symbol)}
              scriptUrl={scriptUrl + "advanced-chart.js"}
              height={600}
            />
          </div>
        </section>

        {/* Right Column - Second Section */}
        <section className="flex flex-col gap-8">
          <Button className="w-full h-12 bg-yellow-400  font-semibold">add to watchlist</Button>
          {/* Technical Analysis Widget */}
          <div>
            <TradingViewWidget
              config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
              scriptUrl={scriptUrl + "technical-analysis.js"}
              height={400}
              className="custom-chart"
            />
          </div>

          {/* Company Profile Widget */}
          <div>
            <TradingViewWidget
              config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
              scriptUrl={scriptUrl + "symbol-profile.js"}
              height={440}
              className="custom-chart"
            />
          </div>

          {/* Company Financials Widget */}
          <div>
            <TradingViewWidget
              config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
              scriptUrl={scriptUrl + "financials.js"}
              height={464}
              className="custom-chart"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

export default SymbolPage
