/**
 * Gemini API for complaint analysis.
 * Uses REST API - no SDK required. Add VITE_GEMINI_API_KEY to .env
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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
}

const CATEGORIES: ComplaintCategory[] = [
  "air",
  "water",
  "noise",
  "transport",
  "soil",
  "land",
];

/**
 * Analyze complaint text and optional image using Gemini.
 * Returns category and suggestion.
 */
export async function analyzeComplaint(
  description: string,
  imageBase64?: string,
  imageMimeType?: string
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

  parts.push({
    text: `You are an environmental complaint analyzer for Delhi. Analyze the following complaint (text and/or image) and respond with ONLY a valid JSON object (no markdown, no extra text) in this exact format:

{"category": "<one of: ${CATEGORIES.join(", ")}>", "suggestion": "<your helpful suggestion for the citizen - what they can do, who to contact, or how to resolve. 1-3 sentences.>"}

RULES:
- category MUST be exactly one of: ${CATEGORIES.join(", ")}
- air: air pollution, smoke, dust, fumes, AQI issues
- water: water pollution, drainage, sewage, drinking water
- noise: noise pollution, loud sounds, construction noise
- transport: traffic, roads, public transport, vehicles
- soil: land pollution, waste dumping, contaminated soil
- land: illegal construction, encroachment, land use issues

Complaint from citizen:
${description}`,
  });

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 256,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error("No response from Gemini");
  }

  const parsed = JSON.parse(text) as { category?: string; suggestion?: string };
  const category = parsed.category?.toLowerCase();
  if (!CATEGORIES.includes(category as ComplaintCategory)) {
    return {
      category: "land",
      suggestion:
        parsed.suggestion ||
        "We've received your complaint. Our team will review it shortly.",
    };
  }

  return {
    category: category as ComplaintCategory,
    suggestion:
      parsed.suggestion ||
      "Thank you for reporting. Our team will look into this.",
  };
}

export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}
