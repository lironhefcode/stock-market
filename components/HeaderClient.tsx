"use client"

import Navitems from "./Navitems"
import UserDropdown from "./UserDropdown"
import AlertsBell from "./AlertsBell"
import PushNotificationManager from "./PushNotificationManger"

type HeaderClientProps = {
  initialStocks: StockWithWatchlistStatus[]
  watchlistSymbols: string[]
  user: User
  triggeredAlerts: Alert[]
}

export default function HeaderClient({ initialStocks, watchlistSymbols, user, triggeredAlerts }: HeaderClientProps) {
  return (
    <>
      <PushNotificationManager />
      <nav className="hidden sm:block">
        <Navitems watchlistSymbols={watchlistSymbols} initialStocks={initialStocks} />
      </nav>
      <div className="flex items-center gap-2">
        <AlertsBell triggeredAlerts={triggeredAlerts} />
        <UserDropdown watchlistSymbols={watchlistSymbols} user={user} initialStocks={initialStocks} />
      </div>
    </>
  )
}
