"use client"

import { Bell, X, TrendingUp, TrendingDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTriggeredAlerts, useDismissAlert, useDismissAllAlerts } from "@/hooks/useAlerts"
import { formatCurrency } from "@/lib/utils"

type AlertsBellProps = {
  triggeredAlerts: Alert[]
}

export default function AlertsBell({ triggeredAlerts }: AlertsBellProps) {
  const { data: alerts = [] } = useTriggeredAlerts(triggeredAlerts)
  const dismissMutation = useDismissAlert()
  const dismissAllMutation = useDismissAllAlerts()

  const count = alerts.length

  const formatTime = (iso: string | null) => {
    if (!iso) return ""
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "Just now"
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-800 transition-colors duration-150 cursor-pointer">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-yellow-400 px-1 text-[10px] font-bold text-gray-900">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-h-[420px] bg-gray-800 border border-gray-600 rounded-lg p-0 overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <div className="h-0.5 bg-yellow-400" />

        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-bold text-gray-300">Triggered Alerts</span>
          </div>
          {count > 0 && (
            <button
              onClick={() => dismissAllMutation.mutate()}
              disabled={dismissAllMutation.isPending}
              className="text-xs font-mono text-gray-500 hover:text-yellow-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[340px]">
          {count === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="h-8 w-8 mx-auto mb-3 text-gray-600" />
              <p className="text-sm text-gray-500">No triggered alerts</p>
              <p className="text-xs text-gray-600 mt-1">Alerts will appear here when price thresholds are crossed.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {alerts.map((alert) => {
                const isUpper = alert.alertType === "upper"
                const Icon = isUpper ? TrendingUp : TrendingDown
                const conditionColor = isUpper ? "text-teal-400" : "text-red-400"

                return (
                  <div key={alert.id} className="px-4 py-3 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-gray-200">{alert.symbol}</span>
                          <div className={`flex items-center gap-0.5 ${conditionColor}`}>
                            <Icon className="h-3 w-3" />
                            <span className="text-[10px] font-mono uppercase">{isUpper ? "Above" : "Below"}</span>
                          </div>
                        </div>
                        <p className="text-xs text-yellow-500 font-semibold truncate">{alert.alertName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Threshold: {formatCurrency(alert.threshold)}
                          {alert.lastCheckedPrice != null && (
                            <span className="ml-2">Price: {formatCurrency(alert.lastCheckedPrice)}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          onClick={() => dismissMutation.mutate(alert.id)}
                          disabled={dismissMutation.isPending}
                          className="p-1 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-600 transition-colors cursor-pointer disabled:opacity-50"
                          title="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[10px] text-gray-600 font-mono">{formatTime(alert.triggeredAt ?? null)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
