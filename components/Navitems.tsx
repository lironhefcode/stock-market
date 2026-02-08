"use client"
import { NAV_ITEMS } from "@/lib/constants"
import Link from "next/link"
import { usePathname } from "next/navigation"
import SearchCommand from "./SearchCommand"
import { WatchlistItem } from "@/db/models/watchlist"

const Navitems = ({
  watchlistSymbols,
  initialStocks,
}: {
  watchlistSymbols: string[]
  initialStocks: StockWithWatchlistStatus[]
}) => {
  const pathname = usePathname()
  const isActive = (path: string) => {
    if (path === "/") {
      return "/" === pathname
    }
    return pathname.startsWith(path)
  }
  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-8">
      {NAV_ITEMS.map((item) => {
        if (item.title === "Search") {
          return (
            <li key={item.href}>
              <SearchCommand watchlistSymbols={watchlistSymbols} initialStocks={initialStocks} />
            </li>
          )
        }
        const active = isActive(item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`text-sm font-mono font-bold uppercase tracking-wider transition-colors duration-150 ${
                active
                  ? "text-yellow-400"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              {item.title}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default Navitems
