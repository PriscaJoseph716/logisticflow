import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Building2, Mail, Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AuthButton from "./AuthButton";
import AuthInput from "./AuthInput";

const signUpSchema = z
  .object({
    fullName: z.string().min(1, "Full Name is required"),
    companyName: z.string().min(1, "Company Name is required"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpPageProps {
  onSubmit: (values: SignUpFormValues) => Promise<void> | void;
  onSwitchToSignIn: () => void;
}

export default function SignUpPage({ onSubmit, onSwitchToSignIn }: SignUpPageProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div className="signup-shell">
      <div className="signup-card auth-card-fade-in">
        <div className="signup-brand">
          <div className="signup-logo" aria-hidden="true">
            <Box size={22} strokeWidth={2.25} />
          </div>
          <div className="signup-brand-text">
            <strong>LogisticsFlow</strong>
            <span>Smart Logistics SaaS</span>
          </div>
        </div>

        <div className="signup-heading">
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit(async (values) => onSubmit(values))} noValidate>
          <AuthInput
            label="Full Name"
            icon={User}
            placeholder="name"
            autoComplete="name"
            registration={register("fullName")}
            error={errors.fullName?.message}
          />
          <AuthInput
            label="Company Name"
            icon={Building2}
            placeholder="Acme Logistics"
            autoComplete="organization"
            registration={register("companyName")}
            error={errors.companyName?.message}
          />
          <AuthInput
            label="Email Address"
            icon={Mail}
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            registration={register("email")}
            error={errors.email?.message}
          />
          <AuthInput
            label="Password"
            icon={Lock}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            registration={register("password")}
            error={errors.password?.message}
            isPassword
          />
          <AuthInput
            label="Confirm Password"
            icon={Lock}
            placeholder="Re-enter password"
            autoComplete="new-password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
            isPassword
          />

          <div className="signup-actions">
            <AuthButton type="submit" loading={isSubmitting}>
              Create Account
            </AuthButton>
          </div>
        </form>

        <p className="signup-switch">
          Already have an account?{" "}
          <button type="button" onClick={onSwitchToSignIn}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
