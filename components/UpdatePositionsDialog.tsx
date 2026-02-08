"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { updatePositions } from "@/lib/actions/group.actions"
import { useState, useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"
import StockSearchDialog from "@/components/StockSearchDialog"
import { useFieldArray, useForm } from "react-hook-form"
import Postions from "./forms/group/Positions"

type UpdatePositionsFormData = {
  positions: StockPosition[]
}

type UpdatePositionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPositions: StockPosition[]
  initialStocks?: StockWithWatchlistStatus[]
}

const UpdatePositionsDialog = ({ open, onOpenChange, currentPositions, initialStocks = [] }: UpdatePositionsDialogProps) => {
  const [stockSearchOpen, setStockSearchOpen] = useState(false)

  const form = useForm<UpdatePositionsFormData>({
    defaultValues: {
      positions: currentPositions,
    },
    mode: "onBlur",
  })
  // prettier-ignore
  const {control,handleSubmit,formState: { isSubmitting },watch,} = form

  useEffect(() => {
    if (currentPositions?.length) {
      form.reset({ positions: currentPositions })
    }
  }, [currentPositions, form])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "positions",
  })

  const positions = watch("positions")

  const totalInvestment = useMemo(() => {
    return positions?.reduce((sum, pos) => sum + (pos.amountInvested || 0), 0) || 0
  }, [positions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const onSubmit = async (data: UpdatePositionsFormData) => {
    try {
      const symbols = data.positions.map((p) => p.symbol.toUpperCase().trim())
      const uniqueSymbols = new Set(symbols)
      if (symbols.length !== uniqueSymbols.size) {
        toast.error("Duplicate stock symbols are not allowed")
        return
      }

      for (const position of data.positions) {
        if (!position.amountInvested || position.amountInvested <= 0) {
          toast.error(`Amount invested for ${position.symbol} must be greater than 0`)
          return
        }
      }

      const res = await updatePositions(data.positions)
      if (!res.success) {
        throw new Error(res.error || "Failed to update positions")
      }
      toast.success("Positions updated successfully!")
      onOpenChange(false)
    } catch (error) {
      console.error("Update positions error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update positions")
    }
  }

  const addPosition = (symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase().trim()
    const existingPosition = positions?.find((p) => p.symbol.toUpperCase().trim() === normalizedSymbol)

    if (existingPosition) {
      toast.error(`${normalizedSymbol} is already in your positions`)
      return
    }

    append({ symbol: normalizedSymbol, amountInvested: 0 })
    setStockSearchOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[560px] bg-gray-900 border border-gray-600 rounded-lg p-0 overflow-hidden gap-0">
          {/* Yellow accent strip */}
          <div className="h-1 bg-yellow-400" />

          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-2">Portfolio</p>
                <DialogTitle className="text-3xl font-black text-gray-400 tracking-tight">Edit Positions</DialogTitle>
              </div>
              {fields.length > 0 && (
                <div className="text-right">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">Total</p>
                  <p className="text-2xl font-black text-gray-400 tabular-nums font-mono">{formatCurrency(totalInvestment)}</p>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 pt-6 pb-2 max-h-[calc(90vh-220px)] overflow-y-auto scrollbar-hide-default">
            <form id="positions-form" onSubmit={handleSubmit(onSubmit)}>
              {/* Add Stock Button */}
              <button
                type="button"
                onClick={() => setStockSearchOpen(true)}
                disabled={isSubmitting}
                className="group w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-600 rounded-lg text-gray-500 hover:text-yellow-400 hover:border-yellow-400 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-mono font-bold uppercase tracking-wider">Add Stock</span>
              </button>

              {/* Positions List */}
              {fields.length > 0 ? (
                <div className="border border-gray-600 rounded-lg overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-800 border-b border-gray-700 text-xs font-mono text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Symbol</div>
                    <div className="col-span-5 text-right">Amount</div>
                    <div className="col-span-2" />
                  </div>

                  <Postions form={form} isSubmitting={isSubmitting} fields={fields} remove={remove} />
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-6xl font-black text-gray-800 mb-2">0</p>
                  <p className="text-sm text-gray-500 font-mono">No positions. Add a stock above.</p>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-gray-700 bg-gray-800/50">
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-5 py-2.5 text-sm font-mono font-bold text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="positions-form"
                disabled={isSubmitting || fields.length === 0}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-mono font-bold text-sm uppercase tracking-wider rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StockSearchDialog open={stockSearchOpen} onOpenChange={setStockSearchOpen} onSelect={addPosition} initialStocks={initialStocks} />
    </>
  )
}

export default UpdatePositionsDialog
