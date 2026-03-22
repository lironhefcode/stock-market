import { addToWatchlist, getUserWatchlist, removeFromWatchlist } from "@/lib/actions/watchlist.actions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useWatchList(initialWatchlist: string[]) {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () => getUserWatchlist(),
    initialData: initialWatchlist,
  })
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (symbol: string) => addToWatchlist(symbol),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message)
        return
      }
      toast.success("added to watchlist successfully")
      queryClient.invalidateQueries({ queryKey: ["watchlist"] })
    },
    onError: () => {
      toast.error("Failed to add to watchlist")
    },
  })
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (symbol: string) => removeFromWatchlist(symbol),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message)
        return
      }
      toast.success("removed from watchlist successfully")
      queryClient.invalidateQueries({ queryKey: ["watchlist"] })
    },
    onError: () => {
      toast.error("Failed to remove to watchlist")
    },
  })
}
export function useWatchlistChange(watchlist: string[]) {
  const { mutate: addToWatchlist } = useAddToWatchlist()
  const { mutate: removeFromWatchlist } = useRemoveFromWatchlist()
  return (symbol: string) => {
    if (watchlist.includes(symbol)) {
      removeFromWatchlist(symbol)
    } else {
      addToWatchlist(symbol)
    }
  }
}
