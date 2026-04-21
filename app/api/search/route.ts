import { NextRequest } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/agent";
import type { AgentStreamEvent } from "@/lib/types";

export const maxDuration = 60; // Requires Vercel Pro; on Hobby plan change to 10

const TIMEOUT_MS = 55_000;

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // server-to-server / same-origin — no CORS header sent

  const localhostOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ];
  if (localhostOrigins.includes(origin)) return true;

  // Production domain (set ALLOWED_ORIGIN in Vercel env vars)
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  if (allowedOrigin && origin === allowedOrigin) return true;

  // Vercel preview deployments
  if (origin.endsWith(".vercel.app")) return true;

  return false;
}

const SearchFiltersSchema = z.object({
  location: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-zA-Z0-9\s,\.]+$/,
      "Location must contain only letters, numbers, spaces, commas, and periods"
    ),
  planType: z.enum([
    "RESTAURANTS",
    "MUSEUMS",
    "OUTDOOR",
    "NIGHTLIFE",
    "SHOPPING",
    "ENTERTAINMENT",
    "SPORTS",
    "WELLNESS",
  ]),
  budget: z.enum(["FREE", "LOW", "MEDIUM", "HIGH"]),
  duration: z.enum(["1H", "2H", "HALF_DAY", "FULL_DAY"]),
  company: z.enum(["SOLO", "COUPLE", "FRIENDS", "FAMILY"]),
});

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const parsed = SearchFiltersSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  const filters = parsed.data;

  const encoder = new TextEncoder();

  function encodeEvent(event: AgentStreamEvent): Uint8Array {
    return encoder.encode(JSON.stringify(event) + "\n");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const timeoutId = setTimeout(() => {
        const errorEvent: AgentStreamEvent = {
          type: "error",
          message: "Request timed out after 55 seconds",
        };
        try {
          controller.enqueue(encodeEvent(errorEvent));
          controller.close();
        } catch {
          // Stream may already be closed
        }
      }, TIMEOUT_MS);

      try {
        const agentGen = runAgent(filters);
        for await (const event of agentGen) {
          controller.enqueue(encodeEvent(event));
          if (event.type === "done" || event.type === "error") {
            break;
          }
        }
      } catch (err) {
        console.error("[search] Agent error:", err);
        const errorEvent: AgentStreamEvent = {
          type: "error",
          message: "Something went wrong while searching. Please try again.",
        };
        try {
          controller.enqueue(encodeEvent(errorEvent));
        } catch {
          // Stream may already be closed
        }
      } finally {
        clearTimeout(timeoutId);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
