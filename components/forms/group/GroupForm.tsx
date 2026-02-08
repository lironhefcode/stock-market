"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ActionResult, createGroup, joinGroupWithSnapshot } from "@/lib/actions/group.actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import StockSearchDialog from "@/components/StockSearchDialog"
import { useFieldArray, useForm } from "react-hook-form"
import InputField from "../InputField"
import Postions from "./Positions"

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
      toast.error("Failed to submit request")
    }
  }

  const addPosition = (symbol: string) => {
    append({ symbol: symbol, amountInvested: 0 })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="bg-gray-900 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
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
                  <InputField
                    name="inviteCode"
                    label="Invite Code"
                    placeholder="Enter invite code"
                    register={register}
                    error={errors.inviteCode}
                    validation={{ required: "Invite code is required" }}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Stock Positions</Label>
                <Button type="button" variant="outline" onClick={() => setStockSearchOpen(true)} disabled={isSubmitting} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>

                <Postions fields={fields} remove={remove} form={form} isSubmitting={isSubmitting} />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || fields.length === 0} className="w-full sm:w-auto">
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
