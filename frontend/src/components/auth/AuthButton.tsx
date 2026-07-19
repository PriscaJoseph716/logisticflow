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
      className={`signup-button ${className}`.trim()}
    >
      {loading ? <LoaderCircle size={18} className="signup-button-spinner" /> : null}
      <span>{children}</span>
    </button>
  );
}
