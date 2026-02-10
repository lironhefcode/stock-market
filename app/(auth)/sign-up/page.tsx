"use client"
import CountrySelectField from "@/components/forms/CountrySelectField"
import FooterLink from "@/components/forms/FooterLink"
import InputField from "@/components/forms/InputField"
import SelectField from "@/components/forms/SelectField"

import { Button } from "@/components/ui/button"
import { singUpWithEmail } from "@/lib/actions/auth.actions"
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

const SignUp = () => {
  const router = useRouter()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      country: "IL",
      investmentGoals: "Growth",
      riskTolerance: "Medium",
      preferredIndustry: "Technology",
    },
    mode: "onBlur",
  })
  const onSubmit = async (data: SignUpFormData) => {
    try {
      const res = await singUpWithEmail(data)
      if (res.success) {
        toast.success("Sign-up successful!")
        router.push("/")
      }
    } catch (error) {
      console.error("Sign-up error:", error)
      toast.error("Sign-up failed. Please try again.")
    }
  }
  return (
    <>
      <h1 className="form-title">Sign up</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 ">
        <InputField
          name="fullName"
          placeholder="liron liron"
          label="Full Name"
          register={register}
          error={errors.fullName}
          validation={{ required: "Full name is required" }}
        />
        <InputField
          name="email"
          type="email"
          placeholder="2Qd7o@example.com"
          label="Email"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
          }}
        />
        <InputField
          name="password"
          type="password"
          placeholder="enter your password"
          label="Password"
          register={register}
          error={errors.password}
          validation={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
        />
        <CountrySelectField control={control} label="Country" name="country" error={errors.country} required />
        <SelectField
          name="investmentGoals"
          label="Investment Goals"
          placeholder="Select your investment goals"
          control={control}
          options={INVESTMENT_GOALS}
          error={errors.investmentGoals}
          required
        />
        <SelectField
          name="risk Tolerance"
          label="Risk Tolerance"
          placeholder="Select your risk level"
          control={control}
          options={RISK_TOLERANCE_OPTIONS}
          error={errors.riskTolerance}
          required
        />
        <SelectField
          name="preferredIndustry"
          label="Preferred Industry"
          placeholder="Select your preferred Industry"
          control={control}
          options={PREFERRED_INDUSTRIES}
          error={errors.preferredIndustry}
          required
        />
        <FooterLink href="/sign-in" linkText="Sign In" text="Already have an account?" />
        <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
          {isSubmitting ? "Creating..." : "Sign Up"}
        </Button>
      </form>
    </>
  )
}

export default SignUp
