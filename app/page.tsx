"use client";

import { useSearch } from "@/hooks/useSearch";
import { FilterForm } from "@/components/FilterForm";
import { SearchStatus } from "@/components/SearchStatus";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultsGrid } from "@/components/ResultsGrid";

export default function HomePage() {
  const { plans, isSearching, currentQuery, error, retryAfterSeconds, search } = useSearch();

  const hasResults = plans.length > 0;
  const showEmptyHint = !hasResults && !isSearching && !error;

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Masthead ── */}
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl text-ink tracking-tight">WCID</span>
            <span className="text-line text-lg select-none">·</span>
            <span className="font-sans text-xs text-dust uppercase tracking-widest">Activity Scout</span>
          </div>
          <span className="font-sans text-xs text-dust/60 uppercase tracking-widest hidden sm:block">
            AI&nbsp;Powered
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6">

        {/* ── Hero ── */}
        <section className="pt-14 pb-10">
          <p
            className="animate-fade-up font-sans text-xs text-terra uppercase tracking-widest font-medium mb-5"
            style={{ animationDelay: "0ms" }}
          >
            What's nearby?
          </p>

          <h1
            className="animate-fade-up font-serif text-5xl sm:text-6xl md:text-7xl text-ink leading-[1.05] mb-6"
            style={{ animationDelay: "60ms" }}
          >
            Discover what<br />
            <em className="text-forest">you could do.</em>
          </h1>

          <p
            className="animate-fade-up font-sans text-base text-dust max-w-md leading-relaxed mb-10"
            style={{ animationDelay: "120ms" }}
          >
            Tell us where you are and what you're after. Our AI agent scouts
            the web and surfaces the best plans — in real time.
          </p>

          <div
            className="animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            <FilterForm isSearching={isSearching} onSearch={search} />
          </div>
        </section>

        {/* ── Status / Errors ── */}
        <SearchStatus isSearching={isSearching} currentQuery={currentQuery} />
        {error && <ErrorBanner message={error} retryAfterSeconds={retryAfterSeconds} />}

        {/* ── Empty hint ── */}
        {showEmptyHint && (
          <section className="py-10 pb-24 text-center animate-fade-in">
            <div className="inline-block">
              <p className="font-serif italic text-3xl text-dust/40">
                Your plans will appear here.
              </p>
              <div className="mt-4 h-px w-2/3 mx-auto bg-gradient-to-r from-transparent via-line to-transparent" />
            </div>
          </section>
        )}

        {/* ── Results ── */}
        {(hasResults || isSearching) && (
          <section className="pb-20">
            {hasResults && (
              <div className="flex items-center gap-4 mb-8">
                <p className="font-sans text-xs text-dust uppercase tracking-widest whitespace-nowrap">
                  {plans.length}&nbsp;{plans.length === 1 ? "plan" : "plans"}
                  {isSearching && (
                    <span className="text-forest"> — finding more…</span>
                  )}
                </p>
                <div className="flex-1 h-px bg-line" />
              </div>
            )}
            <ResultsGrid plans={plans} isSearching={isSearching} />
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-line mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="font-serif italic text-dust/50 text-sm">What Can I Do?</span>
          <span className="font-sans text-xs text-dust/40 uppercase tracking-widest">
            Scouted&nbsp;by&nbsp;AI
          </span>
        </div>
      </footer>
    </div>
  );
}
