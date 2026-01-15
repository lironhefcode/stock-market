"use client"

import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { TrendingUp } from "lucide-react"
import { searchStocks } from "@/lib/actions/finnhub.actions"
import { useDebounce } from "@/hooks/useDebounce"

interface StockSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (symbol: string) => void
  initialStocks?: StockWithWatchlistStatus[]
}

export default function StockSearchDialog({
  open,
  onOpenChange,
  onSelect,
  initialStocks = [],
}: StockSearchDialogProps) {
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks)
  const isSearchMode = !!search.trim()
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10)

  const handleSearch = async () => {
    if (!isSearchMode) {
      return setStocks(initialStocks)
    }
    setLoading(true)
    try {
      const res = await searchStocks(search.trim())
      setStocks(res)
    } catch (error) {
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  const debounceSearch = useDebounce(handleSearch, 300)

  useEffect(() => {
    debounceSearch()
  }, [search])

  const handleSelect = (symbol: string) => {
    onSelect(symbol)
    setSearch("")
    onOpenChange(false)
  }

  return (
    <CommandDialog className="search-dialog" open={open} onOpenChange={onOpenChange}>
      <div className="search-field">
        <CommandInput
          value={search}
          onValueChange={setSearch}
          className="search-input"
          placeholder="Type a command or search..."
        />
      </div>
      <CommandList className="search-list scrollbar-hide">
        {loading ? (
          <CommandEmpty>Loading stocks...</CommandEmpty>
        ) : displayStocks?.length === 0 ? (
          <CommandEmpty>{isSearchMode ? "No results found" : "No stocks available"}</CommandEmpty>
        ) : (
          <CommandGroup>
            {displayStocks?.map((stock) => (
              <CommandItem
                className="search-item justify-between"
                key={stock.symbol}
                onSelect={() => handleSelect(stock.symbol)}
              >
                <div className="flex flex-grow-2 items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="search-item-name">{stock.name}</div>
                    <div className="text-sm text-gray-500">
                      {stock.symbol} | {stock.exchange} | {stock.type}
                    </div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
