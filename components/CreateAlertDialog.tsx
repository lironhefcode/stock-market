"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"
import { useCreateAlert, useUpdateAlert } from "@/hooks/useAlerts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { ALERT_TYPE_OPTIONS } from "@/lib/constants"

type CreateAlertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  company: string
  currentPrice?: number
  editAlert?: {
    id: string
    alertName: string
    alertType: "upper" | "lower"
    threshold: number
  }
}

function getThresholdError(alertType: "upper" | "lower", threshold: string, currentPrice?: number) {
  if (!threshold.trim()) {
    return null
  }

  const thresholdNum = Number(threshold)

  if (Number.isNaN(thresholdNum) || thresholdNum <= 0) {
    return "Please enter a valid price threshold"
  }

  if (currentPrice === undefined || Number.isNaN(currentPrice)) {
    return null
  }

  if (alertType === "upper" && thresholdNum <= currentPrice) {
    return `An above alert must be higher than $${currentPrice.toFixed(2)}`
  }

  if (alertType === "lower" && thresholdNum >= currentPrice) {
    return `A below alert must be lower than $${currentPrice.toFixed(2)}`
  }

  return null
}

export default function CreateAlertDialog({ open, onOpenChange, symbol, company, currentPrice, editAlert }: CreateAlertDialogProps) {
  const isEditing = !!editAlert

  const [alertName, setAlertName] = useState(editAlert?.alertName ?? "")
  const [alertType, setAlertType] = useState<"upper" | "lower">(editAlert?.alertType ?? "upper")
  const [threshold, setThreshold] = useState(editAlert?.threshold?.toString() ?? "")

  const createMutation = useCreateAlert()
  const updateMutation = useUpdateAlert()
  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const thresholdError = getThresholdError(alertType, threshold, currentPrice)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAlertName(editAlert?.alertName ?? "")
      setAlertType(editAlert?.alertType ?? "upper")
      setThreshold(editAlert?.threshold?.toString() ?? "")
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const thresholdNum = Number(threshold)
    if (!alertName.trim()) {
      toast.error("Please enter an alert name")
      return
    }
    if (!threshold || isNaN(thresholdNum) || thresholdNum <= 0) {
      toast.error("Please enter a valid price threshold")
      return
    }
    if (thresholdError) {
      toast.error(thresholdError)
      return
    }

    if (isEditing) {
      updateMutation.mutate(
        { alertId: editAlert.id, data: { alertName: alertName.trim(), alertType, threshold, currentPrice } },
        { onSuccess: (res) => { if (res.success) handleOpenChange(false) } },
      )
    } else {
      createMutation.mutate(
        { symbol, company, alertName: alertName.trim(), alertType, threshold, currentPrice },
        { onSuccess: (res) => { if (res.success) handleOpenChange(false) } },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="alert-dialog p-0 overflow-hidden gap-0">
        <div className="h-1 bg-yellow-400" />

        <DialogHeader className="px-6 pt-6 pb-0">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-2">
            {isEditing ? "Edit Alert" : "New Alert"}
          </p>
          <DialogTitle className="alert-title">
            {symbol} &middot; {company}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? "Edit price alert" : "Create a new price alert"} for {symbol}
          </DialogDescription>
          {currentPrice !== undefined && (
            <p className="text-sm text-gray-500 mt-1">
              Current price: <span className="text-gray-300 font-semibold">${currentPrice.toFixed(2)}</span>
            </p>
          )}
        </DialogHeader>

        <form id="alert-form" onSubmit={handleSubmit} className="px-6 pt-5 pb-2 space-y-4">
          <div>
            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5 block">
              Alert Name
            </label>
            <Input
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              placeholder="e.g. Buy signal"
              className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5 block">
              Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALERT_TYPE_OPTIONS.map((opt) => {
                const isSelected = alertType === opt.value
                const Icon = opt.value === "upper" ? TrendingUp : TrendingDown
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setAlertType(opt.value as "upper" | "lower")}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-mono font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? opt.value === "upper"
                          ? "border-teal-500/50 bg-teal-500/10 text-teal-400"
                          : "border-red-500/50 bg-red-500/10 text-red-400"
                        : "border-gray-600 bg-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    Price {opt.value === "upper" ? "above" : "below"}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1.5 block">
              Price Threshold ($)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="0.00"
              className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
              disabled={isSubmitting}
              aria-invalid={!!thresholdError}
            />
            {thresholdError ? (
              <p className="mt-1.5 text-xs text-red-400">{thresholdError}</p>
            ) : currentPrice !== undefined ? (
              <p className="mt-1.5 text-xs text-gray-500">
                {alertType === "upper"
                  ? `Choose a price above $${currentPrice.toFixed(2)} to avoid triggering immediately.`
                  : `Choose a price below $${currentPrice.toFixed(2)} to avoid triggering immediately.`}
              </p>
            ) : null}
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-5 py-2.5 text-sm font-mono font-bold text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors duration-150 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="alert-form"
              disabled={isSubmitting || !!thresholdError}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-mono font-bold text-sm uppercase tracking-wider rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update Alert" : "Create Alert"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
