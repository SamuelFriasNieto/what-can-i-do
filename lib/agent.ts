import Groq from "groq-sdk";
import type { AgentStreamEvent, Plan, PlanType, SearchFilters } from "./types";
import { braveSearch } from "./brave";
import { getImageUrl } from "./images";
import { SYSTEM_PROMPT } from "./prompts";

const MAX_ITERATIONS = 8;

const tools: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "brave_search",
      description:
        "Search the web to find real, specific activities and places. Use varied queries to discover diverse options.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query. Be specific and include location.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "emit_plan",
      description:
        "Emit a validated activity plan found via search. Call immediately after finding a good result — do not batch.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "The name of the activity or place." },
          description: { type: "string", description: "A specific and enticing 2-3 sentence description." },
          category: {
            type: "string",
            description: "The category of the activity.",
            enum: ["RESTAURANTS", "MUSEUMS", "OUTDOOR", "NIGHTLIFE", "SHOPPING", "ENTERTAINMENT", "SPORTS", "WELLNESS"],
          },
          estimatedPrice: { type: "string", description: "Estimated cost, e.g. 'Free', '$10-20 per person'." },
          duration: { type: "string", description: "How long it takes, e.g. '1-2 hours', 'Half day'." },
          sourceUrl: { type: "string", description: "The real URL where this activity was found." },
          sourceName: { type: "string", description: "Source website name, e.g. 'Yelp', 'TripAdvisor'." },
        },
        required: ["title", "description", "category", "estimatedPrice", "duration", "sourceUrl", "sourceName"],
      },
    },
  },
];

function buildUserMessage(filters: SearchFilters): string {
  const budgetLabels: Record<string, string> = {
    FREE: "free",
    LOW: "budget-friendly (under $20)",
    MEDIUM: "moderate budget ($20-60)",
    HIGH: "high-end (no budget limit)",
  };
  const durationLabels: Record<string, string> = {
    "1H": "about 1 hour",
    "2H": "about 2 hours",
    HALF_DAY: "half a day",
    FULL_DAY: "a full day",
  };
  const companyLabels: Record<string, string> = {
    SOLO: "solo",
    COUPLE: "a couple",
    FRIENDS: "a group of friends",
    FAMILY: "a family with kids",
  };
  const categoryLabels: Record<string, string> = {
    RESTAURANTS: "restaurants and dining",
    MUSEUMS: "museums and cultural attractions",
    OUTDOOR: "outdoor activities and parks",
    NIGHTLIFE: "nightlife and bars",
    SHOPPING: "shopping",
    ENTERTAINMENT: "entertainment and shows",
    SPORTS: "sports and active recreation",
    WELLNESS: "wellness and relaxation",
  };

  return `Find ${categoryLabels[filters.planType] ?? filters.planType} activities in ${filters.location}.

Requirements:
- Budget: ${budgetLabels[filters.budget] ?? filters.budget}
- Available time: ${durationLabels[filters.duration] ?? filters.duration}
- Going with: ${companyLabels[filters.company] ?? filters.company}

Search the web to find 5-8 real, specific options. Emit each plan as you find it.`;
}

export async function* runAgent(
  filters: SearchFilters
): AsyncGenerator<AgentStreamEvent> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    yield { type: "error", message: "Groq API key is not configured." };
    return;
  }

  const client = new Groq({ apiKey });

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserMessage(filters) },
  ];

  const emittedUrls = new Set<string>();
  const emittedPlans: Plan[] = [];
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    let response: Groq.Chat.ChatCompletion;
    try {
      response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        tools,
        tool_choice: "auto",
        max_tokens: 4096,
        temperature: 0,
      });
    } catch (err) {
      console.error("[groq] completions error:", err);
      const is429 = err instanceof Error && err.message.includes("429");
      yield {
        type: "error",
        message: is429
          ? "AI rate limit hit. Please wait a moment and try again."
          : "Something went wrong while searching. Please try again.",
      };
      return;
    }

    const message = response.choices[0]?.message;
    if (!message) break;

    messages.push(message);

    const toolCalls = message.tool_calls;
    if (!toolCalls || toolCalls.length === 0) break;

    for (const toolCall of toolCalls) {
      const name = toolCall.function.name;
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      } catch {
        args = {};
      }

      if (name === "brave_search") {
        const query = (args.query as string) ?? "";
        yield { type: "searching", query };

        const results = await braveSearch(query);
        const resultText =
          results.length > 0
            ? results
                .map(
                  (r, i) =>
                    `<search_result>\nResult ${i + 1}:\nTitle: ${r.title.slice(0, 200)}\nURL: ${r.url}\nDescription: ${r.description.slice(0, 500)}\n</search_result>`
                )
                .join("\n\n")
            : "No results found for this query.";

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: resultText,
        });
      } else if (name === "emit_plan") {
        const rawUrl = (args.sourceUrl as string) ?? "";

        if (rawUrl && emittedUrls.has(rawUrl)) {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: "Duplicate URL — already emitted.",
          });
          continue;
        }

        let validatedSourceUrl = rawUrl;
        try {
          const parsed = new URL(rawUrl);
          if (!["http:", "https:"].includes(parsed.protocol)) validatedSourceUrl = "";
        } catch {
          validatedSourceUrl = "";
        }

        if (rawUrl) emittedUrls.add(rawUrl);

        const category = ((args.category as string) ?? "RESTAURANTS") as PlanType;
        const plan: Plan = {
          id: crypto.randomUUID(),
          title: (args.title as string) ?? "",
          description: (args.description as string) ?? "",
          category,
          estimatedPrice: (args.estimatedPrice as string) ?? "",
          duration: (args.duration as string) ?? "",
          imageUrl: getImageUrl(category),
          sourceUrl: validatedSourceUrl,
          sourceName: ((args.sourceName as string) ?? "").slice(0, 40),
        };

        emittedPlans.push(plan);
        yield { type: "plan_found", plan };

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Plan emitted: "${plan.title}"`,
        });
      } else {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Unknown tool: ${name}`,
        });
      }
    }

    if (emittedPlans.length >= 5) break;
  }

  yield { type: "done", totalPlans: emittedPlans.length };
}
