"use client"
import { useState } from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"

import { Star, TrendingUp } from "lucide-react"

import { searchStocks } from "@/lib/actions/finnhub.actions"

import Link from "next/link"

import { Button } from "./ui/button"

import { useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "@/hooks/useDebounceValue"
import { useWatchList, useWatchlistChange } from "@/hooks/useWatchList"

export default function SearchCommand({ initialStocks, watchlistSymbols, renderAs = "text", quickAdd = false }: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const debounceQuery = useDebounceValue(query, 300)
  const { data: stocks, isFetching } = useQuery({
    queryKey: ["searchStocks", debounceQuery],
    queryFn: () => searchStocks(debounceQuery.trim()),
    enabled: debounceQuery.trim().length > 0,
  })
  const handleWatchlistChange = useWatchlistChange(watchlistSymbols)
  const { data: watchlist } = useWatchList(watchlistSymbols)
  const isSearchMode = query.trim().length > 0
  const displayStocks = isSearchMode ? stocks || [] : initialStocks?.slice(0, 10)

  const handleSearch = (value: string) => {
    setQuery(value)
  }

  return (
    <>
      {renderAs == "text" ? (
        <span
          className="text-sm font-mono font-bold uppercase tracking-wider transition-colors duration-150 text-gray-500 hover:text-gray-400 cursor-pointer "
          onClick={() => setOpen(true)}
        >
          Search
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="bg-yellow-300 ">
          Add to Watchlist
        </Button>
      )}

      <CommandDialog className="search-dialog" open={open} onOpenChange={setOpen}>
        <div className="search-field">
          <CommandInput value={query} onValueChange={handleSearch} className="search-input" placeholder="Type a command or search..." />
        </div>
        <CommandList className="search-list scrollbar-hide">
          {isFetching ? (
            <CommandEmpty>loading stock</CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div>{isSearchMode ? "No results found" : "No stocks available"}</div>
          ) : (
            <CommandGroup>
              {displayStocks?.map((stock) => {
                const isAdded = watchlist.some((item) => item == stock.symbol)
                return (
                  <CommandItem
                    className="search-item justify-between"
                    key={stock.symbol}
                    onSelect={() => {
                      if (quickAdd) {
                        handleWatchlistChange(stock.symbol)
                      } else {
                        setOpen(false)
                        setQuery("")
                      }
                    }}
                  >
                    <Link
                      onClick={(e) => {
                        if (quickAdd) {
                          e.preventDefault() // Prevent Next.js navigation
                        }
                      }}
                      href={`/${stock.symbol}`}
                      className="flex flex-grow-2 items-center gap-2"
                    >
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="search-item-name">{stock.name}</div>
                        <div className="text-sm text-gray-500">
                          {stock.symbol} | {stock.exchange.split(" ")[0]}
                        </div>
                      </div>
                    </Link>
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()

                        handleWatchlistChange(stock.symbol)
                      }}
                    >
                      <Star className={["size-4", " text-yellow-500", isAdded ? "fill-amber-300" : ""].join(" ")} />
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
