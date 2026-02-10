"use client";
import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { signInWithEmail } from "@/lib/actions/auth.actions";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SignIn = () => {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });
  const onSubmit = async (data: SignInFormData) => {
    try {
      const res = await signInWithEmail(data);
      if (res.success) {
        toast.success("Sign-in successful!");

        // Check for a pending invite code cookie and redirect to groups page
        const joinCode = document.cookie
          .split("; ")
          .find((c) => c.startsWith("joinCode="))
          ?.split("=")[1];

        if (joinCode) {
          document.cookie = "joinCode=; path=/; max-age=0"; // clear the cookie
          router.push(`/groups?inviteCode=${joinCode}`);
        } else {
          router.push("/");
        }
        return;
      }
      const errorMessage = res.error || "Sign-in failed. Please try again.";
      toast.error(errorMessage);
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };
  return (
    <>
      <h1 className="form-title">Sign in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 ">
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
        <FooterLink
          href="/sign-up"
          linkText="Sign up"
          text="Don't have an account?"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full mt-5"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </>
  );
};

export default SignIn;
