"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ActionResult, createGroup, joinGroupWithSnapshot } from "@/lib/actions/group.actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import StockSearchDialog from "@/components/StockSearchDialog"
import { useFieldArray, useForm } from "react-hook-form"
import InputField from "../InputField"
import Positions from "./Positions"

type GroupFormData = {
  positions: StockPosition[]
  name?: string
  inviteCode?: string
}

interface GroupFormProps {
  initialStocks: StockWithWatchlistStatus[]
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  mode: "create" | "join"
}

const GroupForm = ({ initialStocks, open, onOpenChange, trigger, mode }: GroupFormProps) => {
  const router = useRouter()
  const [stockSearchOpen, setStockSearchOpen] = useState(false)

  const isCreate = mode === "create"
  const accentColorClass = isCreate ? "text-yellow-400" : "text-teal-400"
  const accentBorderClass = isCreate ? "hover:border-yellow-400/60" : "hover:border-teal-400/60"
  const submitBtnClass = isCreate ? "bg-yellow-400 hover:bg-yellow-300 text-gray-900" : "bg-teal-600 hover:bg-teal-500 text-white"

  // Dynamic configuration based on mode
  const config = {
    title: isCreate ? "Create a group" : "Join a group",
    description: isCreate
      ? "Create a new group and add your stock positions with amounts invested."
      : "Provide the invite code and add your stock positions with amounts invested.",
    submitText: isCreate ? "Create group" : "Join group",
    submittingText: isCreate ? "Creating..." : "Joining...",
  }

  const form = useForm<GroupFormData>({
    defaultValues: {
      positions: [],

      ...(isCreate ? { name: "" } : { inviteCode: "" }),
    },
    mode: "onBlur",
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "positions",
  })

  const onSubmit = async (data: GroupFormData) => {
    try {
      let res: ActionResult<GroupResponse>
      if (isCreate) {
        // Force cast to CreatePayload if needed by your action types
        res = await createGroup({ name: data.name!, positions: data.positions })
      } else {
        res = await joinGroupWithSnapshot({ inviteCode: data.inviteCode!, positions: data.positions })
      }
      if (!res.success) {
        throw new Error("action failed")
      }
      toast.success(isCreate ? "Group created!" : "Joined group successfully!")
      onOpenChange(false) // Close dialog on success
      router.push(`/groups/${res.data.groupId}`)
    } catch (error) {
      console.error("Group form error:", error)
      toast.error(`Failed to  ${isCreate ? "create group" : "join group"}`)
    }
  }

  const addPosition = (symbol: string) => {
    append({ symbol: symbol, amountInvested: 0 })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="max-h-[90vh] overflow-y-auto border border-gray-600 bg-gray-900 text-gray-400 p-0 sm:max-w-2xl">
          <div className={`h-1 ${isCreate ? "bg-yellow-400" : "bg-teal-400"}`} />
          <DialogHeader className="px-6 pt-6 pb-1">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">{isCreate ? "New League" : "Enter Existing"}</p>
            <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight text-gray-300">{config.title}</DialogTitle>
            <DialogDescription className="text-gray-500 leading-relaxed">{config.description}</DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2 p-4 bg-gray-800/80 border border-gray-700 rounded-lg">
                {/* Conditionally Render the specific input field */}
                {isCreate ? (
                  <InputField
                    name="name"
                    label="Group Name"
                    placeholder="Enter group name"
                    register={register}
                    error={errors.name}
                    validation={{ required: "Group name is required" }}
                  />
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode" className="form-label">
                      Invite Code
                    </Label>
                    <Input
                      id="inviteCode"
                      placeholder="Enter invite code"
                      {...register("inviteCode", { required: "Invite code is required" })}
                      className="h-12 px-3 py-3 text-white text-base placeholder:text-gray-500 border-teal-500 bg-gray-800 rounded-lg focus:border-teal-500! focus-visible:border-teal-500! focus-visible:ring-teal-500/30 focus-visible:ring-[3px]"
                    />
                    {errors.inviteCode && <p className="text-sm text-red-500">{errors.inviteCode.message}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4 bg-gray-800/80 border border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Label className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">Stock Positions</Label>
                  <div className="h-px flex-1 bg-gray-700" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStockSearchOpen(true)}
                  disabled={isSubmitting}
                  className={`w-full h-11 bg-gray-900 border-gray-600 text-gray-300 hover:bg-gray-800 ${accentBorderClass} ${accentColorClass}`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>

                <Positions fields={fields} remove={remove} form={form} isSubmitting={isSubmitting} mode={mode} />
                {fields.length === 0 && <p className="text-center text-sm text-gray-500 py-2">No positions added yet. Add at least one stock to continue.</p>}
              </div>

              <DialogFooter className="pt-1">
                <Button
                  type="submit"
                  disabled={isSubmitting || fields.length === 0}
                  className={`w-full h-11 sm:w-auto font-semibold transition-colors ${submitBtnClass}`}
                >
                  {isSubmitting ? config.submittingText : config.submitText}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <StockSearchDialog open={stockSearchOpen} onOpenChange={setStockSearchOpen} onSelect={addPosition} initialStocks={initialStocks} />
    </>
  )
}

export default GroupForm
