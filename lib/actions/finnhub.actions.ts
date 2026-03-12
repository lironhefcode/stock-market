"use server"

import { getDateRange, validateArticle, formatArticle } from "@/lib/utils"
import { POPULAR_STOCK_SYMBOLS } from "@/lib/constants"
import { cache } from "react"

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1"
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? ""

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
  const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
    ? { cache: "force-cache", next: { revalidate: revalidateSeconds } }
    : { cache: "no-store" }

  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Fetch failed ${res.status}: ${text}`)
  }
  return (await res.json()) as T
}

export { fetchJSON }

export const getNews = cache(async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
  try {
    const range = getDateRange(5)
    const token = process.env.FINNHUB_API_KEY ?? FINNHUB_API_KEY
    if (!token) {
      throw new Error("FINNHUB API key is not configured")
    }
    const cleanSymbols = (symbols || []).map((s) => s?.trim().toUpperCase()).filter((s): s is string => Boolean(s))

    const maxArticles = 8

    // If we have symbols, try to fetch company news per symbol and round-robin select
    if (cleanSymbols.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {}

      await Promise.all(
        cleanSymbols.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`
            const articles = await fetchJSON<RawNewsArticle[]>(url, 300)
            perSymbolArticles[sym] = (articles || []).filter(validateArticle)
          } catch (e) {
            console.error("Error fetching company news for", sym, e)
            perSymbolArticles[sym] = []
          }
        }),
      )

      const collected: MarketNewsArticle[] = []
      // Round-robin up to 8 picks
      for (let round = 0; round < maxArticles; round++) {
        for (let i = 0; i < cleanSymbols.length; i++) {
          const sym = cleanSymbols[i]
          const list = perSymbolArticles[sym] || []
          if (list.length === 0) continue
          const article = list.shift()
          if (!article || !validateArticle(article)) continue
          collected.push(formatArticle(article, true, sym, round))
          if (collected.length >= maxArticles) break
        }
        if (collected.length >= maxArticles) break
      }

      if (collected.length > 0) {
        // Sort by datetime desc
        collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
        return collected.slice(0, maxArticles)
      }
      // If none collected, fall through to general news
    }

    // General market news fallback or when no symbols provided
    const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`
    const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300)

    const seen = new Set<string>()
    const unique: RawNewsArticle[] = []
    for (const art of general || []) {
      if (!validateArticle(art)) continue
      const key = `${art.id}-${art.url}-${art.headline}`
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(art)
      if (unique.length >= 20) break // cap early before final slicing
    }

    const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx))
    return formatted
  } catch (err) {
    console.error("getNews error:", err)
    throw new Error("Failed to fetch news")
  }
})

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
  try {
    const token = process.env.FINNHUB_API_KEY ?? FINNHUB_API_KEY
    if (!token) {
      // If no token, log and return empty to avoid throwing per requirements
      console.error("Error in stock search:", new Error("FINNHUB API key is not configured"))
      return []
    }

    const trimmed = typeof query === "string" ? query.trim() : ""

    let results: FinnhubSearchResult[] = []

    if (!trimmed) {
      // Fetch top 10 popular symbols' profiles
      const top = POPULAR_STOCK_SYMBOLS.slice(0, 7)
      const profiles = await Promise.all(
        top.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`
            const profile = await fetchJSON<ProfileResponse>(url, 3600)
            return { sym, profile }
          } catch (e) {
            console.error("Error fetching profile2 for", sym, e)
            return { sym, profile: null as ProfileResponse | null }
          }
        }),
      )
      const filterProfiles = profiles.filter(({ profile }) => profile !== null)
      results = filterProfiles
        .map(({ sym, profile }) => {
          const symbol = sym.toUpperCase()

          const r: FinnhubSearchResult = {
            symbol,
            description: profile?.name || profile?.ticker || "",
            exchange: profile?.exchange || "",
          }

          return r
        })
        .filter((x): x is FinnhubSearchResult => Boolean(x))
    } else {
      const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`
      const data = await fetchJSON<FinnhubSearchResponse>(url, 1800)
      results = Array.isArray(data?.result) ? data.result : []
    }

    const mapped: StockWithWatchlistStatus[] = results
      .map((r) => {
        const upper = (r.symbol || "").toUpperCase()
        const name = r.description || upper
        const exchange = r.exchange || "US"
        const item: StockWithWatchlistStatus = {
          symbol: upper,
          name,
          exchange,
          isInWatchlist: false,
        }
        return item
      })
      .slice(0, 15)

    return mapped
  } catch (err) {
    console.error("Error in stock search:", err)
    return []
  }
})
export const getStockChange = cache(async (symbols: string[]) => {
  try {
    const token = process.env.FINNHUB_API_KEY ?? FINNHUB_API_KEY
    if (!token) {
      console.error("FINNHUB API key is not configured")
      return { quotes: {}, profiles: {}, metrics: {} }
    }

    const cleanSymbols = symbols.map((s) => s?.trim().toUpperCase()).filter((s): s is string => Boolean(s))

    if (cleanSymbols.length === 0) {
      return {}
    }
    const quotes: Record<string, QuoteData> = {}
    await Promise.all(
      cleanSymbols.map(async (symbol) => {
        const quote = await fetchJSON<QuoteData>(`${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`, 60)
        quotes[symbol] = quote
      }),
    )

    return quotes
  } catch (error) {
    return {}
  }
})
export const getStockMetrics = cache(
  async (
    symbols: string[],
  ): Promise<{
    quotes: Record<string, QuoteData>
    profiles: Record<string, ProfileData>
    metrics: Record<string, FinancialsData>
  }> => {
    try {
      const token = process.env.FINNHUB_API_KEY ?? FINNHUB_API_KEY
      if (!token) {
        console.error("FINNHUB API key is not configured")
        return { quotes: {}, profiles: {}, metrics: {} }
      }

      const cleanSymbols = symbols.map((s) => s?.trim().toUpperCase()).filter((s): s is string => Boolean(s))

      if (cleanSymbols.length === 0) {
        return { quotes: {}, profiles: {}, metrics: {} }
      }

      const quotes: Record<string, QuoteData> = {}
      const profiles: Record<string, ProfileData> = {}
      const metrics: Record<string, FinancialsData> = {}

      // Fetch quotes, profiles, and metrics for all symbols in parallel
      await Promise.all(
        cleanSymbols.map(async (symbol) => {
          try {
            const [quote, profile, metric] = await Promise.all([
              fetchJSON<QuoteData>(`${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`, 60),
              fetchJSON<ProfileData>(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`, 60),
              fetchJSON<FinancialsData>(`${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(symbol)}&token=${token}`, 60),
            ])
            quotes[symbol] = quote
            profiles[symbol] = profile
            metrics[symbol] = metric
          } catch (e) {
            console.error(`Error fetching data for ${symbol}:`, e)
            // Don't add to objects if fetch fails
          }
        }),
      )

      return { quotes, profiles, metrics }
    } catch (err) {
      console.error("Error in getStockMetrics:", err)
      return { quotes: {}, profiles: {}, metrics: {} }
    }
  },
)
