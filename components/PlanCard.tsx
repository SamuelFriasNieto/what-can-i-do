"use client";

import Image from "next/image";
import type { Plan, PlanType } from "@/lib/types";

interface PlanCardProps {
  plan: Plan;
  index: number;
  featured?: boolean;
}

const CATEGORY_LABELS: Record<PlanType, string> = {
  RESTAURANTS: "Dining",
  MUSEUMS: "Culture",
  OUTDOOR: "Outdoors",
  NIGHTLIFE: "Nightlife",
  SHOPPING: "Shopping",
  ENTERTAINMENT: "Shows",
  SPORTS: "Sports",
  WELLNESS: "Wellness",
};

export function PlanCard({ plan, index, featured = false }: PlanCardProps) {
  const label = CATEGORY_LABELS[plan.category] ?? plan.category;

  if (featured) {
    return (
      <article
        className="animate-fade-up bg-card border border-line rounded-2xl overflow-hidden flex flex-col md:flex-row"
        style={{
          animationDelay: `${index * 80}ms`,
          boxShadow: "0 1px 3px rgba(28,28,26,0.06)",
        }}
      >
        {/* Image */}
        <div className="relative w-full md:w-[42%] shrink-0 h-60 md:h-auto overflow-hidden">
          {plan.imageUrl ? (
            <Image
              src={plan.imageUrl}
              alt={plan.title}
              fill
              sizes="(max-width: 768px) 100vw, 42vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full bg-sprout flex items-center justify-center">
              <span className="font-serif italic text-forest/30 text-xl">{label}</span>
            </div>
          )}
          {/* Category chip over image */}
          <div className="absolute top-4 left-4">
            <span className="inline-block font-sans text-[10px] uppercase tracking-widest bg-card/90 backdrop-blur-sm text-forest px-2.5 py-1 rounded-full">
              {label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-7 md:p-8">
          <p className="font-sans text-[10px] uppercase tracking-widest text-terra mb-3">
            Featured Pick
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-ink leading-snug mb-4">
            {plan.title}
          </h2>
          <p className="font-sans text-sm text-dust leading-relaxed flex-1">
            {plan.description}
          </p>

          <div className="flex items-center justify-between mt-6 pt-5 border-t border-line">
            <div className="flex gap-5 font-sans text-xs text-ink">
              {plan.estimatedPrice && (
                <span>
                  <span className="text-dust uppercase tracking-wider text-[10px] mr-1">Price</span>
                  {plan.estimatedPrice}
                </span>
              )}
              {plan.duration && (
                <span>
                  <span className="text-dust uppercase tracking-wider text-[10px] mr-1">Time</span>
                  {plan.duration}
                </span>
              )}
            </div>
            {plan.sourceUrl && (
              <a
                href={plan.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-xs text-forest hover:text-terra transition-colors underline underline-offset-2 decoration-forest/30 hover:decoration-terra/50"
                aria-label={`View on ${plan.sourceName} (opens in new tab)`}
              >
                {plan.sourceName}&nbsp;↗
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  /* ── Regular card ── */
  return (
    <article
      className="animate-fade-up bg-card border border-line rounded-2xl overflow-hidden flex flex-col hover:border-forest/25 transition-colors group"
      style={{
        animationDelay: `${index * 80}ms`,
        boxShadow: "0 1px 2px rgba(28,28,26,0.05)",
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {plan.imageUrl ? (
          <Image
            src={plan.imageUrl}
            alt={plan.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="h-full bg-sprout flex items-center justify-center">
            <span className="font-serif italic text-forest/30">{label}</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="inline-block font-sans text-[10px] uppercase tracking-widest bg-card/90 backdrop-blur-sm text-ink px-2 py-0.5 rounded-full">
            {label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-serif text-xl text-ink leading-snug mb-2 line-clamp-2">
          {plan.title}
        </h3>
        <p className="font-sans text-sm text-dust leading-relaxed line-clamp-3 flex-1 mb-4">
          {plan.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-line">
          <div className="flex items-center gap-2 font-sans text-xs text-ink">
            {plan.estimatedPrice && <span>{plan.estimatedPrice}</span>}
            {plan.estimatedPrice && plan.duration && (
              <span className="text-line select-none">·</span>
            )}
            {plan.duration && <span className="text-dust">{plan.duration}</span>}
          </div>
          {plan.sourceUrl && (
            <a
              href={plan.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs text-forest hover:text-terra transition-colors"
              aria-label={`View on ${plan.sourceName} (opens in new tab)`}
            >
              {plan.sourceName}&nbsp;↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
