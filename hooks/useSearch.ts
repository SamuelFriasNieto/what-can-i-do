"use client";

import { useState, useRef, useCallback } from "react";
import type { Plan, SearchFilters, AgentStreamEvent } from "@/lib/types";

interface UseSearchReturn {
  plans: Plan[];
  isSearching: boolean;
  currentQuery: string | null;
  error: string | null;
  retryAfterSeconds: number | null;
  search: (filters: SearchFilters) => void;
  reset: () => void;
}

export function useSearch(): UseSearchReturn {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (filters: SearchFilters) => {
    // Cancel any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Reset state for new search
    setPlans([]);
    setError(null);
    setRetryAfterSeconds(null);
    setIsSearching(true);
    setCurrentQuery(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const body = response.body;
      if (!body) {
        throw new Error("No response body");
      }

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split("\n");
        // Keep the last (potentially incomplete) line in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const event = JSON.parse(trimmed) as AgentStreamEvent;

            switch (event.type) {
              case "searching":
                setCurrentQuery(event.query);
                break;
              case "plan_found":
                setPlans((prev) => [...prev, event.plan]);
                break;
              case "done":
                setIsSearching(false);
                setCurrentQuery(null);
                break;
              case "error":
                setError(event.message);
                setRetryAfterSeconds(event.retryAfterSeconds ?? null);
                setIsSearching(false);
                setCurrentQuery(null);
                break;
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      // Process any remaining buffer content
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer.trim()) as AgentStreamEvent;
          if (event.type === "done") {
            setIsSearching(false);
            setCurrentQuery(null);
          }
        } catch {
          // Skip
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // Request was cancelled — do nothing
        return;
      }
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setIsSearching(false);
      setCurrentQuery(null);
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setPlans([]);
    setIsSearching(false);
    setCurrentQuery(null);
    setError(null);
    setRetryAfterSeconds(null);
  }, []);

  return { plans, isSearching, currentQuery, error, retryAfterSeconds, search, reset };
}
