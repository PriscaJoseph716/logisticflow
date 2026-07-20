import { Box } from "lucide-react";

interface BootSplashProps {
  mode: "loading" | "welcome";
  userName?: string;
}

export default function BootSplash({ mode, userName = "" }: BootSplashProps) {
  const firstName = String(userName ?? "").trim().split(/\s+/)[0] || "there";

  return (
    <div className="boot-splash" role="status" aria-live="polite">
      <div className={`boot-splash-card ${mode === "welcome" ? "is-welcome" : "is-loading"}`}>
        <div className="boot-splash-logo-wrap">
          <div className={`boot-splash-logo ${mode === "loading" ? "is-spinning" : "is-settled"}`}>
            <Box size={28} strokeWidth={2.25} />
          </div>
          <div className="boot-splash-ring" aria-hidden="true" />
        </div>

        {mode === "loading" ? (
          <div className="boot-splash-copy">
            <strong>LogisticsFlow</strong>
            <span>Just a moment...</span>
          </div>
        ) : (
          <div className="boot-splash-copy welcome-copy">
            <p>Welcome back</p>
            <h1>{firstName}</h1>
            <span>Everything is ready for you</span>
          </div>
        )}
      </div>
    </div>
  );
}
