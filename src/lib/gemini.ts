/**
 * Gemini API for complaint analysis and location→ward resolution.
 * Uses REST API - no SDK required. Add VITE_GEMINI_API_KEY to .env
 */

import { wards } from "@/data/wards";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Try 1.5-flash first (higher free quota); fallback to 2.0-flash
const GEMINI_MODELS = ["gemini-2.5-flash"] as const;

export type ComplaintCategory =
  | "air"
  | "water"
  | "noise"
  | "transport"
  | "soil"
  | "land";

export interface GeminiAnalysis {
  category: ComplaintCategory;
  suggestion: string;
  wardId: number;
  wardName: string;
}

const CATEGORIES: ComplaintCategory[] = [
  "air",
  "water",
  "noise",
  "transport",
  "soil",
  "land",
];

// Compact ward list for Gemini: "id: name (zone)" - Delhi has 250 wards
const WARDS_LIST = wards
  .map((w) => `${w.id}: ${w.name} (${w.zone})`)
  .join("\n");

/**
 * Analyze complaint text and optional image using Gemini.
 * Returns category, suggestion, and resolved ward from location.
 */
export async function analyzeComplaint(
  description: string,
  imageBase64?: string,
  imageMimeType?: string,
  locationText?: string,
  fallbackWardId?: number
): Promise<GeminiAnalysis> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env");
  }

  const parts: Record<string, unknown>[] = [];

  if (imageBase64 && imageMimeType) {
    parts.push({
      inline_data: {
        mime_type: imageMimeType,
        data: imageBase64,
      },
    });
  }

  const locationHint = locationText?.trim()
    ? `\n\nLocation entered by user: "${locationText.trim()}" - Use this to pick the Delhi ward (1-250) where the complaint is. Match landmarks, areas, sectors (e.g. Rohini, Dwarka, Connaught Place) to the ward list.`
    : fallbackWardId
      ? `\n\nNo specific location given. Use ward ${fallbackWardId} (user's ward) as the complaint location.`
      : `\n\nNo location given. Pick the most likely ward from context, or default to ward 1 if unclear.`;

  parts.push({
    text: `You are an environmental complaint analyzer for Delhi. Delhi has 250 wards. Analyze the complaint and location, then respond with ONLY a valid JSON object (no markdown, no code blocks, no extra text). IMPORTANT: In the suggestion field, use single quotes for any quoted phrases inside the text - do NOT use double quotes. This ensures valid JSON.

{"category": "<one of: ${CATEGORIES.join(", ")}>", "suggestion": "<helpful suggestion - what to do, who to contact. 1-3 sentences. Use single quotes for any quoted words.>", "ward_id": <number 1-250>, "ward_name": "<exact name from list>"}

DELHI WARDS (id: name (zone)):
${WARDS_LIST}

RULES:
- category: exactly one of ${CATEGORIES.join(", ")}
- air: pollution, smoke, dust, fumes | water: drainage, sewage | noise: loud sounds, construction | transport: traffic, roads | soil: waste dumping | land: encroachment, illegal construction
- ward_id: integer 1-250 from the list. Match location/area to the correct Delhi ward.
- ward_name: exact "name" from the list for that ward_id
${locationHint}

Complaint from citizen:
${description}`,
  });

  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 512,
            responseMimeType: "application/json",
          },
        }),
      });

      if (res.status === 429) {
        let retrySec = 60;
        try {
          const data = await res.json();
          const retryInfo = data?.error?.details?.find((d: { retryDelay?: string }) => d.retryDelay);
          if (retryInfo?.retryDelay) retrySec = parseFloat(String(retryInfo.retryDelay).replace("s", "")) || 60;
        } catch { /* ignore */ }
        lastError = new Error(
          `Gemini API rate limit reached. Please wait ${Math.ceil(retrySec)} seconds and try again. Check quota at aistudio.google.com`
        );
        continue; // Try next model
      }

      if (!res.ok) {
        const err = await res.text();
        lastError = new Error(`Gemini API error: ${res.status} - ${err.slice(0, 200)}`);
        continue;
      }

      const data = await res.json();
      let text =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) {
        lastError = new Error("No response from Gemini");
        continue;
      }

      // Robust JSON extraction: strip markdown fences, fix common issues
      let jsonStr = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();
      // Fix unterminated strings: if suggestion has unescaped quotes, wrap in try/catch and try regex fallback
      let parsed: { category?: string; suggestion?: string; ward_id?: number; ward_name?: string };
      try {
        parsed = JSON.parse(jsonStr) as typeof parsed;
      } catch {
        // Fallback: extract fields with regex
        const catMatch = jsonStr.match(/"category"\s*:\s*"([^"]+)"/);
        const sugMatch = jsonStr.match(/"suggestion"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        const wardIdMatch = jsonStr.match(/"ward_id"\s*:\s*(\d+)/);
        const wardNameMatch = jsonStr.match(/"ward_name"\s*:\s*"([^"]*)"/);
        parsed = {
          category: catMatch?.[1] || "land",
          suggestion: sugMatch?.[1]?.replace(/\\(.)/g, "$1") || "Thank you for reporting. Our team will look into this.",
          ward_id: wardIdMatch ? parseInt(wardIdMatch[1], 10) : fallbackWardId || 1,
          ward_name: wardNameMatch?.[1] || "",
        };
      }

      const parsedTyped = parsed as {
        category?: string;
        suggestion?: string;
        ward_id?: number;
        ward_name?: string;
      };
      const category = parsedTyped.category?.toLowerCase();
      const validCategory = CATEGORIES.includes(category as ComplaintCategory)
        ? (category as ComplaintCategory)
        : "land";

      let wardId = Math.min(250, Math.max(1, Number(parsedTyped.ward_id) || fallbackWardId || 1));
      let wardName = parsedTyped.ward_name || "";
      const matchedWard = wards.find((w) => w.id === wardId);
      if (matchedWard) wardName = matchedWard.name;
      else if (fallbackWardId) {
        wardId = fallbackWardId;
        wardName = wards.find((w) => w.id === fallbackWardId)?.name || `Ward ${fallbackWardId}`;
      }

      return {
        category: validCategory,
        suggestion:
          parsedTyped.suggestion ||
          "Thank you for reporting. Our team will look into this.",
        wardId,
        wardName,
      };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError || new Error("Gemini API request failed");
}

export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}
