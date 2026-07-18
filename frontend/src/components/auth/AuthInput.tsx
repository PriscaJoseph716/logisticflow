import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  icon: LucideIcon;
  registration: UseFormRegisterReturn;
  error?: string;
  isPassword?: boolean;
}

export default function AuthInput({
  label,
  icon: Icon,
  registration,
  error,
  isPassword = false,
  className = "",
  ...props
}: AuthInputProps) {
  const [visible, setVisible] = useState(false);
  const inputType = isPassword ? (visible ? "text" : "password") : props.type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-200">{label}</label>
      <div
        className={[
          "group relative flex h-14 items-center gap-3 rounded-[20px] border border-white/10 bg-[#11182b]/80 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
          "transition-all duration-200 focus-within:border-[#7c6cff] focus-within:bg-[#131c31] focus-within:shadow-[0_0_0_4px_rgba(109,91,255,0.14)]",
          error ? "border-rose-400/70 focus-within:border-rose-400 focus-within:shadow-[0_0_0_4px_rgba(244,63,94,0.14)]" : "",
        ].join(" ")}
      >
        <Icon size={18} className="shrink-0 text-slate-400 transition-colors duration-200 group-focus-within:text-[#b2abff]" />
        <input
          {...registration}
          {...props}
          type={inputType}
          className={`w-full border-0 bg-transparent p-0 text-[15px] text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none ${className}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:text-white"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
