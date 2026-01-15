import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import {
  Control,
  FieldArrayPath,
  FieldArrayWithId,
  Path,
  useFieldArray,
  UseFieldArrayRemove,
  useForm,
  UseFormRegister,
  UseFormReturn,
} from "react-hook-form"

type PostionsProps<T extends { positions: StockPosition[] }> = {
  isSubmitting: boolean
  form: ReturnType<typeof useForm<T>>
  fields: FieldArrayWithId<T, any, "id">[]
  remove: UseFieldArrayRemove
}
function Postions<T extends { positions: StockPosition[] }>({ form, isSubmitting, fields, remove }: PostionsProps<T>) {
  return (
    <>
      {fields.length > 0 && (
        <div className="space-y-2 mt-2">
          {fields.map((field, i) => {
            const position = field as unknown as StockPosition & { id: string }
            const amountPath = `positions.${i}.amountInvested` as Path<T>

            return (
              <div
                key={position.id}
                className="flex items-center gap-2 p-2 border border-gray-700 rounded-md bg-gray-800"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{position.symbol}</div>
                  <Input
                    type="number"
                    min="0"
                    disabled={isSubmitting}
                    {...form.register(amountPath, {
                      valueAsNumber: true,
                      required: true,
                    })}
                    placeholder="Amount invested"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(i)}
                  disabled={isSubmitting}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default Postions
