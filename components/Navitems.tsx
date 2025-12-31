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
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
      {NAV_ITEMS.map((item) => {
        if (item.title === "Search") {
          return (
            <li key={item.href}>
              <SearchCommand watchlistSymbols={watchlistSymbols} initialStocks={initialStocks} />
            </li>
          )
        }
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`hover:text-yellow-500 transition-colors ${isActive(item.href) ? "text-gray-100" : ""}`}
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
