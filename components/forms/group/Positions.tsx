import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { FieldArrayWithId, Path, UseFieldArrayRemove, useForm } from "react-hook-form"

type PositionsProps<T extends { positions: StockPosition[] }> = {
  isSubmitting: boolean
  form: ReturnType<typeof useForm<T>>
  fields: FieldArrayWithId<T, any, "id">[]
  remove: UseFieldArrayRemove
}
function Positions<T extends { positions: StockPosition[] }>({ form, isSubmitting, fields, remove }: PositionsProps<T>) {
  return (
    <>
      {fields.length > 0 && (
        <div className="border border-gray-600 rounded-lg overflow-hidden mt-2">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-800 border-b border-gray-700 text-xs font-mono text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Symbol</div>
            <div className="col-span-5 text-right">Amount</div>
            <div className="col-span-2" />
          </div>

          {/* Rows */}
          {fields.map((field, i) => {
            const position = field as unknown as StockPosition & { id: string }
            const amountPath = `positions.${i}.amountInvested` as Path<T>

            return (
              <div
                key={position.id}
                className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50 transition-colors duration-100"
              >
                {/* Row number */}
                <div className="col-span-1">
                  <span className="text-sm font-black text-gray-600 tabular-nums">{i + 1}</span>
                </div>

                {/* Symbol */}
                <div className="col-span-4">
                  <span className="font-mono font-bold text-yellow-400 text-base tracking-wider">{position.symbol}</span>
                </div>

                {/* Amount input */}
                <div className="col-span-5">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={isSubmitting}
                      {...form.register(amountPath, {
                        valueAsNumber: true,
                        required: true,
                      })}
                      placeholder="0"
                      className="pl-7 h-9 bg-gray-800 border-gray-600 text-gray-400 placeholder:text-gray-600 focus:border-yellow-400 focus:ring-0 font-mono text-right tabular-nums rounded"
                    />
                  </div>
                </div>

                {/* Remove */}
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    disabled={isSubmitting}
                    className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-colors duration-100 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default Positions
