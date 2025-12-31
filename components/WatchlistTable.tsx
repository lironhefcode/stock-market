"use client"

import Link from "next/link"
import { WatchlistItem } from "@/db/models/watchlist"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown } from "lucide-react"

interface WatchlistTableProps {
  watchlistItems: WatchlistItem[]
  quotes: Record<string, QuoteData>
}

export default function WatchlistTable({ watchlistItems, quotes }: WatchlistTableProps) {
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

  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) return "N/A"
    return `$${price.toFixed(2)}`
  }

  const formatChangePercent = (changePercent?: number): string => {
    if (changePercent === undefined || changePercent === null) return "N/A"
    const sign = changePercent >= 0 ? "+" : ""
    return `${sign}${changePercent.toFixed(2)}%`
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="watchlist">
      <Table className="watchlist-table">
        <TableHeader>
          <TableRow className="table-header-row">
            <TableHead className="table-header">Symbol</TableHead>
            <TableHead className="table-header">Company</TableHead>
            <TableHead className="table-header">Current Price</TableHead>
            <TableHead className="table-header">Change %</TableHead>
            <TableHead className="table-header">Added Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlistItems.map((item) => {
            const quote = quotes[item.symbol]
            const currentPrice = quote?.c
            const changePercent = quote?.dp
            const isPositive = changePercent !== undefined && changePercent >= 0

            return (
              <TableRow key={`${item.userId}-${item.symbol}`} className="table-row">
                <TableCell className="table-cell">
                  <Link href={`/${item.symbol}`} className="text-yellow-500 hover:text-yellow-400 font-semibold">
                    {item.symbol}
                  </Link>
                </TableCell>
                <TableCell className="table-cell">{item.company}</TableCell>
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
                <TableCell className="table-cell">{formatDate(item.addedAt)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
