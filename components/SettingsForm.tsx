"use client"

import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import SelectField from "@/components/forms/SelectField"
import CountrySelectField from "@/components/forms/CountrySelectField"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { updateUser } from "@/lib/actions/auth.actions"
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants"
import { User, Mail, Shield, Bell } from "lucide-react"

const SettingsForm = ({ user }: { user: User }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserFormData>({
    defaultValues: {
      country: user.country || "US",
      investmentGoals: user.investmentGoals || "Growth",
      riskTolerance: user.riskTolerance || "Medium",
      preferredIndustry: user.preferredIndustry || "Technology",
      receiveDailyEmails: user.receiveDailyEmails ?? true,
      showInvestmentToGroup: user.showInvestmentToGroup ?? true,
    },
    mode: "onBlur",
  })

  const onSubmit = async (data: UpdateUserFormData) => {
    try {
      const res = await updateUser(data)
      if (res.success) {
        toast.success("Settings updated successfully!")
      } else {
        toast.error(res.error || "Failed to update settings.")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  const initials = user.name
    .replace(/[\u200E\u200F\u202A-\u202E]/g, "")
    .trim()
    .charAt(0)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0 divide-y divide-gray-700">
      {/* ── Account Info (read-only) ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-10 py-10 first:pt-0">
        <div>
          <h2 className="text-sm font-bold text-gray-300 mb-1">Account</h2>
          <p className="text-xs text-gray-500 leading-relaxed">Your account details. These cannot be changed.</p>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-700">
            <div className="h-12 w-12 rounded-lg bg-yellow-400 flex items-center justify-center text-gray-900 font-black text-lg shrink-0">{initials}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-gray-300">
                <User className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                <span className="text-sm font-medium truncate">{user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-mono truncate">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Preferences ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-10 py-10">
        <div>
          <h2 className="text-sm font-bold text-gray-300 mb-1">Preferences</h2>
          <p className="text-xs text-gray-500 leading-relaxed">Customize your investment profile and region. These affect your dashboard and daily digest.</p>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-5 space-y-5">
          <CountrySelectField control={control} name="country" label="Country" error={errors.country} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SelectField
              name="investmentGoals"
              label="Investment Goals"
              placeholder="Select goals"
              control={control}
              options={INVESTMENT_GOALS}
              error={errors.investmentGoals}
            />
            <SelectField
              name="riskTolerance"
              label="Risk Tolerance"
              placeholder="Select risk level"
              control={control}
              options={RISK_TOLERANCE_OPTIONS}
              error={errors.riskTolerance}
            />
          </div>
          <SelectField
            name="preferredIndustry"
            label="Preferred Industry"
            placeholder="Select industry"
            control={control}
            options={PREFERRED_INDUSTRIES}
            error={errors.preferredIndustry}
          />
        </div>
      </div>

      {/* ── Notifications ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-10 py-10">
        <div>
          <h2 className="text-sm font-bold text-gray-300 mb-1">Notifications</h2>
          <p className="text-xs text-gray-500 leading-relaxed">Control what emails you receive and what your group members can see.</p>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded-lg divide-y divide-gray-700">
          <Controller
            name="receiveDailyEmails"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-4 p-5 cursor-pointer group hover:bg-gray-750 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-yellow-400/10 flex items-center justify-center shrink-0">
                  <Bell className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">Daily Market News Email</span>
                  <p className="text-xs text-gray-500 mt-0.5">Market news tailored to your preferences, delivered every morning.</p>
                </div>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
          <Controller
            name="showInvestmentToGroup"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-4 p-5 cursor-pointer group hover:bg-gray-750 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-teal-400/10 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">Show Investments to Group</span>
                  <p className="text-xs text-gray-500 mt-0.5">Allow group members to see your portfolio positions.</p>
                </div>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
        </div>
      </div>

      {/* ── Save ───────────────────────────────────── */}
      <div className="flex justify-end pt-8">
        <Button type="submit" disabled={isSubmitting} className="yellow-btn px-10">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}

export default SettingsForm
