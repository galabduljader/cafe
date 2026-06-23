import { supabase } from "./supabaseClient";

export interface DurationEstimate {
  estimate: string;
  rationale?: string;
}

/**
 * Ask the `estimate-duration` edge function (OpenRouter) how long a task
 * might take. Throws a friendly Error on failure.
 */
export async function estimateDuration(input: {
  title: string;
  description: string | null;
  priority: string;
}): Promise<DurationEstimate> {
  const { data, error } = await supabase.functions.invoke("estimate-duration", {
    body: input,
  });

  if (error) {
    // Try to surface the function's own error message from its response body.
    let msg = error.message ?? "The oracle could not be reached.";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) msg = body.error;
      }
    } catch {
      // ignore parse failures
    }
    throw new Error(msg);
  }

  if (data?.error) throw new Error(data.error);
  if (!data?.estimate) throw new Error("The oracle returned no estimate.");

  return { estimate: data.estimate as string, rationale: data.rationale };
}
