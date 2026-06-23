// Supabase Edge Function: estimate-duration
// Calls OpenRouter to suggest how long a task might take.
//
// Required secret:  OPENROUTER_API_KEY
// Optional secret:  OPENROUTER_MODEL  (default: openai/gpt-4o-mini)
//
// Deployed with verify_jwt = false because this single-list app authenticates
// with a Supabase *publishable* key (sb_publishable_...), which is not a JWT.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const MODEL = Deno.env.get("OPENROUTER_MODEL") ?? "openai/gpt-4o-mini";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface RequestBody {
  title?: string;
  description?: string | null;
  priority?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Use POST" }, 405);
  }
  if (!OPENROUTER_API_KEY) {
    return json(
      { error: "OPENROUTER_API_KEY is not configured on the function." },
      500
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const title = (body.title ?? "").trim();
  if (!title) {
    return json({ error: "A task title is required." }, 400);
  }
  const description = (body.description ?? "").toString().trim();
  const priority = (body.priority ?? "").toString().trim();

  const userPrompt =
    `Estimate how long this to-do task will realistically take for one person.\n\n` +
    `Title: ${title}\n` +
    (description ? `Details: ${description}\n` : "") +
    (priority ? `Priority: ${priority}\n` : "") +
    `\nReturn ONLY a compact JSON object with two keys:\n` +
    `  "estimate": a short human duration phrase (e.g. "about 2 hours", "1–2 days", "30 minutes"),\n` +
    `  "rationale": one short sentence (max ~15 words) explaining the estimate.\n` +
    `Keep the estimate concise and realistic. No markdown, no extra keys.`;

  try {
    const resp = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          // Optional attribution headers recommended by OpenRouter
          "HTTP-Referer": "https://enchanted-tasks.local",
          "X-Title": "Enchanted Tasks",
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.4,
          max_tokens: 200,
          messages: [
            {
              role: "system",
              content:
                "You are a precise project-planning assistant. You reply with strict JSON only.",
            },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!resp.ok) {
      const detail = await resp.text();
      return json(
        { error: `OpenRouter error (${resp.status})`, detail },
        502
      );
    }

    const data = await resp.json();
    const content: string =
      data?.choices?.[0]?.message?.content?.toString() ?? "";

    // Be tolerant: extract the first {...} block, then parse.
    let estimate = "";
    let rationale = "";
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        estimate = (parsed.estimate ?? "").toString().trim();
        rationale = (parsed.rationale ?? "").toString().trim();
      } catch {
        // fall through
      }
    }
    if (!estimate) {
      // last resort: use the raw text, trimmed to something sane
      estimate = content.trim().slice(0, 60) || "Unknown";
    }

    return json({ estimate, rationale, model: MODEL });
  } catch (err) {
    return json(
      {
        error: "Failed to reach OpenRouter.",
        detail: err instanceof Error ? err.message : String(err),
      },
      502
    );
  }
});
