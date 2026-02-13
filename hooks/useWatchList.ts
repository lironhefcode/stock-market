import { getSession } from "@/lib/actions/auth.actions"
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function useWatchList(initialWatchlist: string[]) {
  const router = useRouter()
  const [watchlist, setWatchlist] = useState<string[]>(initialWatchlist)
  const handleWatchlistChange = async (symbol: string) => {
    const isInWatchlist = watchlist.find((item) => item === symbol)
    setWatchlist(isInWatchlist ? watchlist.filter((item) => item !== symbol) : [symbol, ...watchlist])
    try {
      const { session, success, error } = await getSession()
      if (!session?.user) {
        throw new Error(error)
      }
      const res = !isInWatchlist ? await addToWatchlist(symbol, session.user.id) : await removeFromWatchlist(symbol, session.user.id)

      if (!res.success) {
        throw new Error(error)
      }
      toast.success(`${!isInWatchlist ? "added" : "removed"} ${symbol} ${!isInWatchlist ? "to" : "from"} watchlist`)
      router.refresh()
    } catch (error) {
      toast.error(`${!isInWatchlist ? "failed to add" : "failed to remove"} ${symbol} ${!isInWatchlist ? "to" : "from"} watchlist`)
      setWatchlist([...watchlist])
    }
  }
  return { watchlist, handleWatchlistChange }
}
