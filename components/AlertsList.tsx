"use client"

import { useState } from "react"
import { Bell, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { useActiveAlerts, useDeleteAlert } from "@/hooks/useAlerts"
import { formatCurrency } from "@/lib/utils"
import CreateAlertDialog from "./CreateAlertDialog"

type AlertsListProps = {
  initialAlerts: Alert[]
}

export default function AlertsList({ initialAlerts }: AlertsListProps) {
  const { data: alerts = [] } = useActiveAlerts(initialAlerts)
  const deleteMutation = useDeleteAlert()
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)

  if (alerts.length === 0) {
    return (
      <div className="alert-empty">
        <Bell className="h-8 w-8 mx-auto mb-3 text-gray-600" />
        <p className="text-sm font-mono text-gray-600">No active alerts</p>
        <p className="text-xs text-gray-600 mt-1">Use the bell icon on any watchlist row to create one.</p>
      </div>
    )
  }

  return (
    <>
      <div className="alert-list">
        {alerts.map((alert) => {
          const isUpper = alert.alertType === "upper"
          const Icon = isUpper ? TrendingUp : TrendingDown
          const conditionColor = isUpper ? "text-teal-400" : "text-red-400"

          return (
            <div key={alert.id} className="alert-item">
              <p className="alert-name">{alert.alertName}</p>
              <div className="alert-details">
                <div>
                  <p className="text-sm font-mono font-bold text-gray-200">{alert.symbol}</p>
                  <p className="alert-company">{alert.company}</p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 justify-end ${conditionColor}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-mono uppercase">{isUpper ? "Above" : "Below"}</span>
                  </div>
                  <p className="alert-price">{formatCurrency(alert.threshold)}</p>
                </div>
              </div>
              <div className="alert-actions">
                <p className="text-xs text-gray-500 font-mono">Active</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingAlert(alert)}
                    className="alert-update-btn p-1.5"
                    title="Edit alert"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(alert.id)}
                    disabled={deleteMutation.isPending}
                    className="alert-delete-btn p-1.5 disabled:opacity-50"
                    title="Delete alert"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {editingAlert && (
        <CreateAlertDialog
          open={!!editingAlert}
          onOpenChange={(open) => !open && setEditingAlert(null)}
          symbol={editingAlert.symbol}
          company={editingAlert.company}
          currentPrice={editingAlert.lastCheckedPrice ?? undefined}
          editAlert={{
            id: editingAlert.id,
            alertName: editingAlert.alertName,
            alertType: editingAlert.alertType,
            threshold: editingAlert.threshold,
          }}
        />
      )}
    </>
  )
}
