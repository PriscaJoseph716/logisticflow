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
    <div className="signup-field">
      <label className="signup-label">{label}</label>
      <div className={`signup-input-wrap${error ? " is-error" : ""}`}>
        <span className="signup-input-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <input
          {...registration}
          {...props}
          type={inputType}
          className={`signup-input ${className}`.trim()}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="signup-eye"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>
      {error ? <p className="signup-error">{error}</p> : null}
    </div>
  );
}
