"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"
import Navitems from "./Navitems"
import { signOut } from "@/lib/actions/auth.actions"

const UserDropdown = ({ user, initialStocks, watchlistSymbols }: { user: User; initialStocks: StockWithWatchlistStatus[]; watchlistSymbols: string[] }) => {
  const router = useRouter()
  const handleSignOut = async () => {
    await signOut()
    router.push("/sign-in")
  }
  const initials = user.name
    .replace(/[\u200E\u200F\u202A-\u202E]/g, "")
    .trim()
    .charAt(0)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border-0 bg-transparent hover:bg-gray-800 sm:border sm:border-gray-600 sm:bg-gray-800 sm:hover:bg-gray-700 sm:hover:border-yellow-400/50 transition-colors duration-150 cursor-pointer"
        >
          <Avatar className="h-7 w-7 rounded-md">
            <AvatarImage src="https://github.com/" />
            <AvatarFallback className="bg-yellow-400 text-gray-900 text-xs font-black rounded-md">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-mono font-bold text-gray-400 hidden sm:inline">{user.name.split(" ")[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-gray-800 border border-gray-600 rounded-lg p-0 overflow-hidden">
        {/* Yellow accent strip */}
        <div className="h-0.5 bg-yellow-400" />

        {/* User info */}
        <DropdownMenuLabel className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarFallback className="bg-yellow-400 text-gray-900 text-sm font-black rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-gray-400 truncate">{user.name}</span>
              <span className="text-xs font-mono text-gray-500 truncate">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-700 m-0" />

        {/* Mobile nav */}
        <nav className="sm:hidden px-2 py-2 border-b border-gray-700">
          <Navitems watchlistSymbols={watchlistSymbols} initialStocks={initialStocks} />
        </nav>

        {/* Logout */}
        <DropdownMenuItem
          className="mx-2 my-2 px-3 py-2.5 rounded text-sm font-mono font-bold text-gray-500 uppercase tracking-wider hover:text-red-500 focus:text-red-500 focus:bg-red-500/10 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export default UserDropdown
