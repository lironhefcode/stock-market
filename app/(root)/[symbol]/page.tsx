import TradingViewWidget from "@/components/TradingViewWidget"
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants"

interface SymbolPageProps {
  params: Promise<{ symbol: string }>
}

const SymbolPage = async ({ params }: SymbolPageProps) => {
  const { symbol } = await params
  const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-"

  return (
    <div className="flex min-h-screen home-wrapper">
      <section className="grid w-full gap-8 home-section">
        {/* Candle Chart Widget */}
        <div className="md:col-span-1 xl:col-span-2">
          <TradingViewWidget
            config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
            scriptUrl={scriptUrl + "advanced-chart.js"}
            title={`${symbol.toUpperCase()} Chart`}
            height={600}
          />
        </div>
        {/* Symbol Info Widget */}
        <div className="md:col-span-1 xl:col-span-1">
          <TradingViewWidget
            config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
            scriptUrl={scriptUrl + "symbol-info.js"}
            title={`${symbol.toUpperCase()} Overview`}
            height={170}
          />
        </div>
      </section>

      <section className="grid w-full gap-8 home-section">
        {/* Technical Analysis Widget */}
        <div className="h-full md:col-span-1 xl:col-span-1">
          <TradingViewWidget
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
            scriptUrl={scriptUrl + "technical-analysis.js"}
            title={`${symbol.toUpperCase()} Technical Analysis`}
            height={400}
            className="custom-chart"
          />
        </div>

        {/* Company Profile Widget */}
        <div className="h-full md:col-span-1 xl:col-span-1">
          <TradingViewWidget
            config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
            scriptUrl={scriptUrl + "symbol-profile.js"}
            title={`${symbol.toUpperCase()} Company Profile`}
            height={440}
            className="custom-chart"
          />
        </div>

        {/* Company Financials Widget */}
        <div className="h-full md:col-span-1 xl:col-span-1">
          <TradingViewWidget
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
            scriptUrl={scriptUrl + "financials.js"}
            title={`${symbol.toUpperCase()} Financials`}
            height={464}
            className="custom-chart"
          />
        </div>
      </section>
    </div>
  )
}

export default SymbolPage
