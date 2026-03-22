"use client"
import { useWatchList, useWatchlistChange } from "@/hooks/useWatchList"
import { Button } from "./ui/button"

function HandleWatchListBtn({ symbol, initialWatchlist }: { symbol: string; initialWatchlist: string[] }) {
  const { data: watchlist } = useWatchList(initialWatchlist)
  const handleWatchlistChange = useWatchlistChange(watchlist)
  const isInWatchlist = watchlist.find((item) => item === symbol)

  return (
    <Button className="yellow-btn w-full sm:w-auto px-6" onClick={() => handleWatchlistChange(symbol)}>
      {isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    </Button>
  )
}

export default HandleWatchListBtn
