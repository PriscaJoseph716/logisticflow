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
    <div className="relative w-full max-w-[520px]">
      <div className="pointer-events-none absolute inset-x-10 -top-12 h-48 rounded-full bg-[radial-gradient(circle,rgba(125,90,255,0.34),rgba(125,90,255,0)_68%)] blur-3xl" />

      <div className="auth-card-fade-in relative overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
        <div className="space-y-8">
          <div className="space-y-5 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#7C6CFF] via-[#635BFF] to-[#4F46E5] shadow-[0_18px_50px_rgba(99,91,255,0.35)]">
              <Box size={28} className="text-white" />
            </div>
            <div className="space-y-2">
              <div className="text-[1.1rem] font-semibold tracking-[0.24em] text-white">LOGISTICSFLOW</div>
              <p className="text-sm text-slate-400">Smart Logistics SaaS</p>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[2rem]">Create Your Account</h1>
            <p className="mx-auto max-w-md text-sm leading-6 text-slate-400 sm:text-[15px]">
              Create your company workspace and start managing your logistics operations.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(async (values) => onSubmit(values))}>
            <AuthInput
              label="Full Name"
              icon={User}
              placeholder="John Doe"
              autoComplete="name"
              registration={register("fullName")}
              error={errors.fullName?.message}
            />
            <AuthInput
              label="Company Name"
              icon={Building2}
              placeholder="LogisticsFlow Ltd"
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

            <div className="pt-2">
              <AuthButton type="submit" loading={isSubmitting}>
                Create Account
              </AuthButton>
            </div>
          </form>

          <div className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="font-medium text-[#8a7dff] transition-colors duration-200 hover:text-[#b2abff]"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
