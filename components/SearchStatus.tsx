"use client";

interface SearchStatusProps {
  isSearching: boolean;
  currentQuery: string | null;
}

export function SearchStatus({ isSearching, currentQuery }: SearchStatusProps) {
  if (!isSearching) return null;

  return (
    <div className="flex items-center gap-4 mb-8" aria-live="polite" aria-label="Search in progress">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-line" />
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="dot-bounce inline-block w-1.5 h-1.5 rounded-full bg-forest"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        <p className="font-serif italic text-sm text-dust whitespace-nowrap">
          {currentQuery ? <>Scouting: &ldquo;{currentQuery}&rdquo;</> : "Searching…"}
        </p>
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-line" />
    </div>
  );
}
