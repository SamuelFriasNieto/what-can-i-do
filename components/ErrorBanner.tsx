"use client";

import { useEffect, useState } from "react";

interface ErrorBannerProps {
  message: string;
  retryAfterSeconds?: number | null;
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "now";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

export function ErrorBanner({ message, retryAfterSeconds }: ErrorBannerProps) {
  const [remaining, setRemaining] = useState<number | null>(
    retryAfterSeconds ?? null
  );

  useEffect(() => {
    if (!retryAfterSeconds || retryAfterSeconds <= 0) {
      setRemaining(null);
      return;
    }
    setRemaining(retryAfterSeconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfterSeconds]);

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 border border-terra/25 bg-terra/5 rounded-xl px-5 py-4"
    >
      <svg
        className="text-terra mt-0.5 shrink-0"
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7.5 1.5L13.5 13H1.5L7.5 1.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 6V8.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="7.5" cy="10.5" r="0.75" fill="currentColor" />
      </svg>
      <div className="flex flex-col gap-1">
        <p className="font-sans text-sm text-ink/75 leading-relaxed">{message}</p>
        {remaining !== null && (
          <p className="font-sans text-xs text-terra/80">
            {remaining > 0 ? (
              <>
                Try again in{" "}
                <span className="font-medium tabular-nums">
                  {formatCountdown(remaining)}
                </span>
              </>
            ) : (
              "You can try again now."
            )}
          </p>
        )}
      </div>
    </div>
  );
}
