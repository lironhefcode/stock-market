"use client"

import Link from "next/link"
import { WatchlistItem } from "@/db/models/watchlist"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Trash2, MoreHorizontal, ExternalLink } from "lucide-react"
import { formatMarketCapValue } from "@/lib/utils"
import { getSession } from "@/lib/actions/auth.actions"
import { removeFromWatchlist } from "@/lib/actions/watchlist.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

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

  // Calculate summary statistics
  const calculateStats = () => {
    let totalGainers = 0
    let totalLosers = 0
    let totalValue = 0
    let validPrices = 0

    optimisticItems.forEach((symbol) => {
      const quote = quotes[symbol]
      const changePercent = quote?.dp
      const price = quote?.c

      if (changePercent !== undefined && changePercent !== null) {
        if (changePercent > 0) totalGainers++
        else if (changePercent < 0) totalLosers++
      }

      if (price !== undefined && price !== null) {
        totalValue += price
        validPrices++
      }
    })

    const avgPrice = validPrices > 0 ? totalValue / validPrices : 0

    return {
      totalStocks: optimisticItems.length,
      totalGainers,
      totalLosers,
      avgPrice,
    }
  }

  const stats = calculateStats()

  const handleRemove = async (symbol: string) => {
    // Optimistic update
    setRemovingSymbols((prev) => new Set(prev).add(symbol))
    setOptimisticItems((prev) => prev.filter((item) => item !== symbol))
    setSelectedItems((prev) => {
      const next = new Set(prev)
      next.delete(symbol)
      return next
    })

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

  const toggleSelectAll = () => {
    if (selectedItems.size === optimisticItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(optimisticItems))
    }
  }

  const toggleSelectItem = (symbol: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(symbol)) {
        next.delete(symbol)
      } else {
        next.add(symbol)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col-reverse lg:flex-col gap-6">
      {/* Summary Cards - Written first, shows first on desktop, second on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="watchlist-summary-card">
          <div className="watchlist-summary-label">Total Stocks</div>
          <div className="watchlist-summary-value">{stats.totalStocks}</div>
        </div>
        <div className="watchlist-summary-card">
          <div className="watchlist-summary-label">Gainers</div>
          <div className="watchlist-summary-value text-teal-400">{stats.totalGainers}</div>
        </div>
        <div className="watchlist-summary-card">
          <div className="watchlist-summary-label">Losers</div>
          <div className="watchlist-summary-value text-red-500">{stats.totalLosers}</div>
        </div>
        <div className="watchlist-summary-card">
          <div className="watchlist-summary-label">Avg Price</div>
          <div className="watchlist-summary-value">${stats.avgPrice.toFixed(2)}</div>
        </div>
      </div>

      {/* Table - Written second, shows first on mobile, second on desktop */}
      <div className="watchlist-modern-table">
        <Table>
          <TableHeader>
            <TableRow className="watchlist-modern-header-row">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedItems.size === optimisticItems.length && optimisticItems.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-gray-500"
                />
              </TableHead>
              <TableHead className="watchlist-modern-header">Symbol</TableHead>
              <TableHead className="watchlist-modern-header">Company</TableHead>
              <TableHead className="watchlist-modern-header">Price</TableHead>
              <TableHead className="watchlist-modern-header">Change</TableHead>
              <TableHead className="watchlist-modern-header">Market Cap</TableHead>
              <TableHead className="watchlist-modern-header">P/E Ratio</TableHead>
              <TableHead className="w-12"></TableHead>
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
                <TableRow key={symbol} className="watchlist-modern-row">
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.has(symbol)}
                      onCheckedChange={() => toggleSelectItem(symbol)}
                      className="border-gray-500"
                    />
                  </TableCell>
                  <TableCell className="watchlist-modern-cell">
                    <Link href={`/${symbol}`} className="watchlist-symbol-link">
                      {symbol}
                    </Link>
                  </TableCell>
                  <TableCell className="watchlist-modern-cell watchlist-company-name">
                    {profile?.name ?? "N/A"}
                  </TableCell>
                  <TableCell className="watchlist-modern-cell watchlist-price">{formatPrice(currentPrice)}</TableCell>
                  <TableCell className="watchlist-modern-cell">
                    <div className={`flex items-center gap-1.5 ${isPositive ? "text-teal-400" : "text-red-500"}`}>
                      {changePercent !== undefined && changePercent !== null ? (
                        isPositive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )
                      ) : null}
                      <span className="font-semibold">{formatChangePercent(changePercent)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="watchlist-modern-cell">
                    {marketCap !== undefined && marketCap !== null ? formatMarketCapValue(marketCap) : "N/A"}
                  </TableCell>
                  <TableCell className="watchlist-modern-cell">{formatPERatio(peRatio)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="watchlist-action-btn">
                        <MoreHorizontal className="h-5 w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800 border-gray-600" align="end">
                        <DropdownMenuItem className="text-gray-400 hover:text-gray-200 hover:bg-gray-700 cursor-pointer">
                          <Link href={`/${symbol}`} className="flex items-center gap-2 w-full">
                            <ExternalLink className="h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemove(symbol)}
                          disabled={removingSymbols.has(symbol)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
