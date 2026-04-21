"use client";

import { useState } from "react";
import type { SearchFilters, PlanType, Budget, Duration, Company } from "@/lib/types";

interface FilterFormProps {
  isSearching: boolean;
  onSearch: (filters: SearchFilters) => void;
}

const planTypes: { value: PlanType; label: string }[] = [
  { value: "RESTAURANTS", label: "Dining" },
  { value: "MUSEUMS", label: "Culture" },
  { value: "OUTDOOR", label: "Outdoors" },
  { value: "NIGHTLIFE", label: "Nightlife" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "ENTERTAINMENT", label: "Shows" },
  { value: "SPORTS", label: "Sports" },
  { value: "WELLNESS", label: "Wellness" },
];

const budgets: { value: Budget; label: string }[] = [
  { value: "FREE", label: "Free" },
  { value: "LOW", label: "Budget" },
  { value: "MEDIUM", label: "Mid-range" },
  { value: "HIGH", label: "Luxury" },
];

const durations: { value: Duration; label: string }[] = [
  { value: "1H", label: "1 hour" },
  { value: "2H", label: "2 hours" },
  { value: "HALF_DAY", label: "Half day" },
  { value: "FULL_DAY", label: "Full day" },
];

const companies: { value: Company; label: string }[] = [
  { value: "SOLO", label: "Solo" },
  { value: "COUPLE", label: "Couple" },
  { value: "FRIENDS", label: "Friends" },
  { value: "FAMILY", label: "Family" },
];

function FieldSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-sans text-[10px] uppercase tracking-widest text-dust">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="appearance-none bg-transparent border border-line rounded-lg pl-3 pr-7 py-2 font-sans text-sm text-ink cursor-pointer hover:border-forest/50 focus:border-forest transition-colors outline-none min-w-[100px]"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-dust"
          width="10" height="10" viewBox="0 0 10 10" fill="none"
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function FilterForm({ isSearching, onSearch }: FilterFormProps) {
  const [location, setLocation] = useState("");
  const [planType, setPlanType] = useState<PlanType>("RESTAURANTS");
  const [budget, setBudget] = useState<Budget>("MEDIUM");
  const [duration, setDuration] = useState<Duration>("HALF_DAY");
  const [company, setCompany] = useState<Company>("COUPLE");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = location.trim();
    if (!trimmed) return;
    onSearch({ location: trimmed, planType, budget, duration, company });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="bg-card border border-line rounded-2xl overflow-hidden shadow-sm" style={{ boxShadow: "0 1px 3px rgba(28,28,26,0.06), 0 1px 2px rgba(28,28,26,0.04)" }}>

        {/* Location */}
        <div className="px-6 pt-5 pb-4 border-b border-line">
          <label htmlFor="location" className="block font-sans text-[10px] uppercase tracking-widest text-dust mb-2">
            Where are you?
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Barcelona, Spain"
            autoComplete="off"
            className="w-full bg-transparent font-serif text-2xl text-ink placeholder:text-dust/35 outline-none border-b-2 border-transparent focus:border-forest pb-1 transition-colors"
          />
        </div>

        {/* Filters + submit */}
        <div className="px-6 py-4 flex flex-wrap items-end gap-4 justify-between" style={{ backgroundColor: "rgba(245,243,238,0.5)" }}>
          <div className="flex flex-wrap gap-3">
            <FieldSelect label="Type" value={planType} options={planTypes} onChange={setPlanType} />
            <FieldSelect label="Budget" value={budget} options={budgets} onChange={setBudget} />
            <FieldSelect label="Duration" value={duration} options={durations} onChange={setDuration} />
            <FieldSelect label="With" value={company} options={companies} onChange={setCompany} />
          </div>

          <button
            type="submit"
            disabled={isSearching || !location.trim()}
            className="bg-forest text-card font-sans text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-forest/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap self-end"
          >
            {isSearching ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
                  <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Scouting…
              </>
            ) : (
              "Find Plans"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
