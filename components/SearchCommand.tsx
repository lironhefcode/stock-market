"use client"
import { use, useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"

import { redirect, useRouter } from "next/navigation"

import { Star, TrendingUp } from "lucide-react"

import { searchStocks } from "@/lib/actions/finnhub.actions"

import { useDebounce } from "@/hooks/useDebounce"
import { set } from "mongoose"
import Link from "next/link"

export default function SearchCommand({ initialStocks }: SearchCommandProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setloading] = useState(false)
  const [search, setSearch] = useState("")
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks)
  const isSearchMode = !!search.trim()
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10)

  const handleSearch = async () => {
    if (!isSearchMode) {
      return setStocks(initialStocks)
    }
    setloading(true)
    try {
      const res = await searchStocks(search.trim())
      setStocks(res)
    } catch (error) {
      setStocks([])
    } finally {
      setloading(false)
    }
  }
  const debounceSearch = useDebounce(handleSearch, 300)

  useEffect(() => {
    debounceSearch()
  }, [search])
  return (
    <>
      <span className="search-text " onClick={() => setOpen(true)}>
        Search
      </span>

      <CommandDialog className="search-dialog" open={open} onOpenChange={setOpen}>
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
            <CommandEmpty>loading stock</CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div>{isSearchMode ? "no  result found" : " no stock avilabe"}</div>
          ) : (
            <CommandGroup>
              {displayStocks?.map((stock) => {
                return (
                  <CommandItem
                    className="search-item justify-between"
                    key={stock.symbol}
                    onSelect={() => {
                      setOpen(false)
                      setSearch("")
                    }}
                  >
                    <Link href={`/${stock.symbol}`} className="flex flex-grow-2 items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="search-item-name">{stock.name}</div>
                        <div className="text-sm text-gray-500">
                          {stock.symbol} | {stock.exchange} | {stock.type}
                        </div>
                      </div>
                    </Link>

                    <Star className="size-4 text-yellow-500" />
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
