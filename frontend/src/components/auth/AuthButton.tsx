import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export default function AuthButton({ loading = false, children, className = "", disabled, ...props }: AuthButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        "inline-flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#6D5BFF] to-[#4F46E5]",
        "px-5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.35)] transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(109,91,255,0.42)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6d5bff]/25",
        "disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:translate-y-0",
        className,
      ].join(" ")}
    >
      {loading ? <LoaderCircle size={18} className="animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
