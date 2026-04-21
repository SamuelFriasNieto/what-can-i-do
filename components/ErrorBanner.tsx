interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
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
      <p className="font-sans text-sm text-ink/75 leading-relaxed">{message}</p>
    </div>
  );
}
