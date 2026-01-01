"use client"

import Link from "next/link"
import { WatchlistItem } from "@/db/models/watchlist"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Trash2 } from "lucide-react"
import { formatMarketCapValue } from "@/lib/utils"
import { getSession } from "@/lib/actions/auth.actions"
import { removeFromWatchlist } from "@/lib/actions/watchlist.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"

interface WatchlistTableProps {
  watchlistItems: string[]
  quotes: Record<string, QuoteData>
  profiles: Record<string, ProfileData>
  metrics: Record<string, FinancialsData>
}

export default function WatchlistTable({ watchlistItems, quotes, profiles, metrics }: WatchlistTableProps) {
  const router = useRouter()
  const [removingSymbols, setRemovingSymbols] = useState<Set<string>>(new Set())
  const [optimisticItems, setOptimisticItems] = useState<string[]>(watchlistItems)

  // Sync optimistic state with props when they change (e.g., after router.refresh())
  useEffect(() => {
    setOptimisticItems(watchlistItems)
  }, [watchlistItems])

  if (watchlistItems.length === 0) {
    return (
      <div className="watchlist-empty-container">
        <div className="watchlist-empty">
          <h2 className="empty-title">Your watchlist is empty</h2>
          <p className="empty-description">Start adding stocks to your watchlist to track their performance.</p>
        </div>
      </div>
    )
  }

  const handleRemove = async (symbol: string) => {
    // Optimistic update
    setRemovingSymbols((prev) => new Set(prev).add(symbol))
    setOptimisticItems((prev) => prev.filter((item) => item !== symbol))

    try {
      const sessionResult = await getSession()
      if (!sessionResult.success || !sessionResult.session?.user?.id) {
        throw new Error("User not authenticated")
      }

      const result = await removeFromWatchlist(symbol, sessionResult.session.user.id)
      if (result.success) {
        toast.success(result.message || "Removed from watchlist successfully")
        router.refresh()
      } else {
        // Revert optimistic update on error
        setOptimisticItems((prev) => [...prev, symbol].sort())
        toast.error(result.message || "Failed to remove from watchlist")
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticItems((prev) => [...prev, symbol].sort())
      toast.error("An error occurred while removing from watchlist")
      console.error("Error removing from watchlist:", error)
    } finally {
      setRemovingSymbols((prev) => {
        const next = new Set(prev)
        next.delete(symbol)
        return next
      })
    }
  }
  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) return "N/A"
    return `$${price.toFixed(2)}`
  }

  const formatChangePercent = (changePercent?: number): string => {
    if (changePercent === undefined || changePercent === null) return "N/A"
    const sign = changePercent >= 0 ? "+" : ""
    return `${sign}${changePercent.toFixed(2)}%`
  }

  const formatPERatio = (peRatio?: number): string => {
    if (peRatio === undefined || peRatio === null || !Number.isFinite(peRatio)) return "N/A"
    return peRatio.toFixed(2)
  }

  return (
    <Table className="watchlist-table">
      <TableHeader>
        <TableRow className="table-header-row">
          <TableHead className="table-header">Symbol</TableHead>
          <TableHead className="table-header">Company</TableHead>
          <TableHead className="table-header">Current Price</TableHead>
          <TableHead className="table-header">Change %</TableHead>
          <TableHead className="table-header">Market Cap</TableHead>
          <TableHead className="table-header">PE Ratio</TableHead>
          <TableHead className="table-header">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {optimisticItems.map((symbol) => {
          const quote = quotes[symbol]
          const profile = profiles[symbol]
          const metric = metrics[symbol]
          const currentPrice = quote?.c
          const changePercent = quote?.dp
          const marketCap = profile?.marketCapitalization
          const peRatio = metric?.metric?.peNormalizedAnnual
          const isPositive = changePercent !== undefined && changePercent >= 0

          return (
            <TableRow key={symbol} className="table-row">
              <TableCell className="table-cell">
                <Link href={`/${symbol}`} className="text-sm">
                  {symbol}
                </Link>
              </TableCell>
              <TableCell className="table-cell">{profile.name}</TableCell>
              <TableCell className="table-cell">{formatPrice(currentPrice)}</TableCell>
              <TableCell className="table-cell">
                <div className={`flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {changePercent !== undefined && changePercent !== null ? (
                    isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )
                  ) : null}
                  {formatChangePercent(changePercent)}
                </div>
              </TableCell>
              <TableCell className="table-cell">
                {marketCap !== undefined && marketCap !== null ? formatMarketCapValue(marketCap) : "N/A"}
              </TableCell>
              <TableCell className="table-cell">{formatPERatio(peRatio)}</TableCell>
              <TableCell className="flex justify-center items-center ">
                <button
                  onClick={() => handleRemove(symbol)}
                  disabled={removingSymbols.has(symbol)}
                  className="trash-icon cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Remove ${symbol} from watchlist`}
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
