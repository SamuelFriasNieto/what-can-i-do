"use client";

import type { Plan } from "@/lib/types";
import { PlanCard } from "./PlanCard";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface ResultsGridProps {
  plans: Plan[];
  isSearching: boolean;
}

export function ResultsGrid({ plans, isSearching }: ResultsGridProps) {
  const showInitialSkeletons = isSearching && plans.length === 0;

  if (showInitialSkeletons) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton featured />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  const [featured, ...rest] = plans;

  return (
    <div className="space-y-5">
      {featured && <PlanCard plan={featured} index={0} featured />}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i + 1} />
          ))}
          {isSearching && (
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          )}
        </div>
      )}
    </div>
  );
}
