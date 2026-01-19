import Image from "next/image"
import Link from "next/link"
import Navitems from "./Navitems"
import UserDropdown from "./UserDropdown"
import { searchStocks } from "@/lib/actions/finnhub.actions"
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions"
import { WatchlistItem } from "@/db/models/watchlist"

const Header = async ({ user }: { user: User }) => {
  const initialStocks = await searchStocks()
  const watchlistSymbols = (await getWatchlistSymbolsByEmail(user.email)) as string[]

  return (
    <header className="sticky top-0 header">
      <div className="container header-wrapper">
        <Link href="/">
          <Image
            src="/assets/icons/header.png"
            alt="logo"
            width={140}
            height={40}
            className="h-14 w-auto cursor-pointer"
          />
        </Link>
        <nav className="hidden sm:block">
          <Navitems watchlistSymbols={watchlistSymbols} initialStocks={initialStocks} />
        </nav>
        <UserDropdown watchlistSymbols={watchlistSymbols} user={user} initialStocks={initialStocks} />
      </div>
    </header>
  )
}

export default Header
