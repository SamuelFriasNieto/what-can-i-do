export type PlanType =
  | "RESTAURANTS"
  | "MUSEUMS"
  | "OUTDOOR"
  | "NIGHTLIFE"
  | "SHOPPING"
  | "ENTERTAINMENT"
  | "SPORTS"
  | "WELLNESS";

export type Budget = "FREE" | "LOW" | "MEDIUM" | "HIGH";

export type Duration = "1H" | "2H" | "HALF_DAY" | "FULL_DAY";

export type Company = "SOLO" | "COUPLE" | "FRIENDS" | "FAMILY";

export interface SearchFilters {
  location: string;
  planType: PlanType;
  budget: Budget;
  duration: Duration;
  company: Company;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  category: PlanType;
  estimatedPrice: string;
  duration: string;
  imageUrl: string | null;
  sourceUrl: string;
  sourceName: string;
}

export type AgentStreamEvent =
  | { type: "searching"; query: string }
  | { type: "plan_found"; plan: Plan }
  | { type: "done"; totalPlans: number }
  | { type: "error"; message: string };
