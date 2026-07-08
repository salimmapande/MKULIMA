import type { FarmerProfile, SoilAnalysisResult, SoilObservation } from "./types";
import { cropLabels } from "./crops";
import { SITE_CONFIG } from "./site";
import { fallbackSoilAnalysis } from "./soil";

interface ChatContext {
  profile: FarmerProfile;
  messages: { role: string; content: string }[];
}

function buildSystemPrompt(profile: FarmerProfile): string {
  const crops = profile.crops.map((c) => cropLabels[c].en).join(", ") || "general crops";
  const lang = profile.language === "sw" ? "Swahili (Kiswahili)" : "English";
  return `You are Mkulima AI, a warm and practical agricultural advisor for smallholder farmers in Tanzania.

Farmer context:
- Name: ${profile.name || "Farmer"}
- Wilaya / Kijiji: ${profile.location || "Not specified"}
- Mkoa (Region): ${profile.region || "Not specified"}
- Country: ${SITE_CONFIG.country}
- Farm size: ${profile.farmSize || "Not specified"}
- Crops: ${crops}

Guidelines:
- Respond primarily in ${lang}. Use simple, clear language farmers understand.
- Give actionable, specific advice for Tanzanian conditions (regions, seasons, local crops).
- Reference Tanzanian extension services (TARI, TOSCI) and local practices when relevant.
- Mention local crop varieties, seasons, and common pests when relevant.
- Keep responses concise (2-4 short paragraphs max).
- When unsure, say so and recommend consulting a local extension officer (Mtaalamu wa kilimo).
- Be encouraging and respectful — farmers work hard.`;
}

export async function generateChatResponse(ctx: ChatContext): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: buildSystemPrompt(ctx.profile) },
            ...ctx.messages.slice(-10),
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices[0]?.message?.content ?? fallbackResponse(ctx);
      }
    } catch {
      // fall through to local response
    }
  }

  return fallbackResponse(ctx);
}

function fallbackResponse(ctx: ChatContext): string {
  const lastMsg = ctx.messages[ctx.messages.length - 1]?.content.toLowerCase() ?? "";
  const isSw = ctx.profile.language === "sw";
  const crops = ctx.profile.crops.map((c) => cropLabels[c][isSw ? "sw" : "en"]).join(", ");
  const region = ctx.profile.region || (isSw ? "Tanzania" : "Tanzania");

  if (lastMsg.includes("armyworm") || lastMsg.includes("mdudu")) {
    return isSw
      ? `Mdudu wa jeshi (fall armyworm) ni tatizo kubwa kwa mahindi nchini Tanzania. Angalia majani ya ndani ya mmea kila wiki. Tumia dawa ya Bt au dawa inayopendekezwa na mtaalamu wa kilimo. Panda mahindi mapema na tumia mbegu zilizo na cheti cha TOSCI. ${crops ? `Kwa ${crops}, fuata ratiba ya dawa.` : ""}`
      : `Fall armyworm is a major maize pest in Tanzania. Scout whorl leaves weekly. Apply Bt or extension-recommended pesticide at first sign. Plant early with TOSCI-certified seed. ${crops ? `For your ${crops}, follow a regular scouting schedule.` : ""}`;
  }

  if (lastMsg.includes("fertilizer") || lastMsg.includes("mbolea")) {
    return isSw
      ? `Mbolea inategemea mazao na hatua ya ukuaji. Kwa mahindi: tumia DAP wakati wa kupanda, CAN wakati yanapofika magoti. Pima udongo kwanza ikiwezekana. Nunua mbolea kutoka maduka yaliyoidhinishwa nchini Tanzania.`
      : `Fertilizer depends on crop and growth stage. For maize: apply DAP at planting, CAN at knee-high stage. Test soil if possible. Buy fertilizer from licensed dealers in Tanzania.`;
  }

  if (lastMsg.includes("rain") || lastMsg.includes("mvua") || lastMsg.includes("weather") || lastMsg.includes("hali")) {
    return isSw
      ? `Panda mazao yako wakati wa mvua za masika (Novemba–Aprili) katika maeneo mengi ya Tanzania. Fuata utabiri wa TMA wa eneo lako${region !== "Tanzania" ? ` (${region})` : ""}. Kausha nafaka vizuri baada ya mavuno — hifadhi kwenye mifuko ya PICS kuepuka wadudu.`
      : `Plant with the main rains (November–April) in most of Tanzania. Monitor TMA weather forecasts for ${region}. Dry grain thoroughly after harvest and store in hermetic PICS bags to prevent weevils.`;
  }

  if (lastMsg.includes("price") || lastMsg.includes("bei") || lastMsg.includes("market") || lastMsg.includes("soko")) {
    return isSw
      ? `Bei za mazao hubadilika kila wiki. Angalia soko la karibu na taarifa za AMIS Tanzania. Usuuzie yote mara moja — hifadhi sehemu kwa bei nzuri zaidi baadaye ikiwa huna mahitaji ya haraka.`
      : `Market prices change weekly. Check your nearest market and AMIS Tanzania price data. Don't sell everything at once — store part of your harvest if you can wait for better prices.`;
  }

  return isSw
    ? `Karibu, ${ctx.profile.name || "mkulima"}! Mimi ni Msaidizi wa Mkulima AI wa Tanzania. Ninaweza kukusaidia na mazao (${crops || "mazao yako"}), mbolea, wadudu, hali ya hewa, na masoko. Uliza swali lolote!`
    : `Welcome, ${ctx.profile.name || "farmer"}! I'm Mkulima AI for Tanzania. I can help with ${crops || "your crops"}, fertilizer, pests, weather timing, and market advice. Ask me anything about your farm!`;
}

export async function generateDiagnosis(
  profile: FarmerProfile,
  imageBase64?: string
): Promise<{ issue: string; confidence: number; treatment: string; prevention: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && imageBase64) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an agricultural plant pathologist for Tanzania. Analyze crop images and respond in JSON only:
{"issue":"...","confidence":0.0-1.0,"treatment":"...","prevention":"..."}
Language: ${profile.language === "sw" ? "Swahili" : "English"}. Be practical for Tanzanian smallholder farmers.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Diagnose this crop issue for a farmer in ${profile.region || "Tanzania"}.`,
                },
                { type: "image_url", image_url: { url: imageBase64 } },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices[0]?.message?.content ?? "";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
      }
    } catch {
      // fall through
    }
  }

  const isSw = profile.language === "sw";
  return {
    issue: isSw
      ? "Dalili zinaweza kuwa ugonjwa wa majani au upungufu wa virutubisho"
      : "Symptoms may indicate leaf blight or nutrient deficiency",
    confidence: 0.72,
    treatment: isSw
      ? "Ondoa majani yaliyoathirika. Nyunyiza dawa ya kuvu inayopendekezwa. Ongeza mbolea ya kompost."
      : "Remove affected leaves. Apply recommended fungicide. Top-dress with compost or organic matter.",
    prevention: isSw
      ? "Panda mbegu safi zenye cheti cha TOSCI, tumia mbinu za kuchanganya mazao, na fuata ratiba ya kupalilia."
      : "Use TOSCI-certified seed, rotate crops, and maintain regular weeding and field hygiene.",
  };
}

export function getWeatherTips(isSw: boolean) {
  const month = new Date().getMonth() + 1;

  // Tanzania: main rains Nov–Apr, dry season Jun–Oct, short rains Oct–Dec (bimodal areas)
  if (month >= 11 || month <= 4) {
    return {
      condition: isSw ? "Msimu wa mvua za masika" : "Main rains season",
      tip: isSw
        ? "Panda mazao yako sasa. Hakikisha mifereji inafanya kazi vizuri."
        : "Ideal planting window across Tanzania. Ensure drainage channels are clear.",
      icon: "rain" as const,
    };
  }
  if (month >= 10 && month <= 12) {
    return {
      condition: isSw ? "Mvua za vuli (eneo la miili mbili)" : "Short rains (bimodal areas)",
      tip: isSw
        ? "Andaa shamba na panda mazao ya msimu mfupi kama maharage."
        : "Prepare land and plant short-season crops like beans.",
      icon: "cloud" as const,
    };
  }
  if (month >= 6 && month <= 9) {
    return {
      condition: isSw ? "Msimu wa kiangazi / kuvuna" : "Dry season / harvest",
      tip: isSw
        ? "Kausha nafaka vizuri na hifadhi kwa mifuko ya PICS."
        : "Sun-dry grain thoroughly. Store in hermetic PICS bags.",
      icon: "sun" as const,
    };
  }
  return {
    condition: isSw ? "Msimu wa maandalizi" : "Land preparation season",
    tip: isSw
      ? "Lima shamba na ongeza mbolea ya asili kabla ya mvua za masika."
      : "Plough and add compost before the main rains arrive.",
    icon: "wind" as const,
  };
}

function observationSummary(obs: SoilObservation): string {
  const parts: string[] = [];
  if (obs.color) parts.push(`color: ${obs.color}`);
  if (obs.texture) parts.push(`texture: ${obs.texture}`);
  if (obs.moisture) parts.push(`moisture: ${obs.moisture}`);
  return parts.length ? parts.join(", ") : "none provided";
}

export async function generateSoilAnalysis(
  profile: FarmerProfile,
  imageBase64?: string,
  observation: SoilObservation = {}
): Promise<SoilAnalysisResult> {
  const isSw = profile.language === "sw";
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && imageBase64) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a soil scientist and agronomist for Tanzania. Analyze soil photos and recommend crops and trees to plant.

Respond in JSON only:
{
  "soilType": "English name",
  "soilTypeSw": "Swahili name",
  "description": "English description",
  "descriptionSw": "Swahili description",
  "properties": {"ph":"...","drainage":"...","fertility":"...","texture":"..."},
  "confidence": 0.0-1.0,
  "recommendations": [
    {"name":"...","nameSw":"...","type":"crop|tree","suitability":"excellent|good|moderate","reason":"...","reasonSw":"..."}
  ],
  "improvements": "English soil improvement advice",
  "improvementsSw": "Swahili soil improvement advice"
}

Include 4-6 recommendations (mix of crops and trees) suited to Tanzanian regions.
Consider region: ${profile.region || "Tanzania"}, location: ${profile.location || "unknown"}.
Farmer observations: ${observationSummary(observation)}.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this soil sample and recommend crops/trees for a farmer in ${profile.region || "Tanzania"}.`,
                },
                { type: "image_url", image_url: { url: imageBase64 } },
              ],
            },
          ],
          max_tokens: 900,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices[0]?.message?.content ?? "";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]) as SoilAnalysisResult;
          if (parsed.recommendations?.length) return parsed;
        }
      }
    } catch {
      // fall through
    }
  }

  return fallbackSoilAnalysis(observation, isSw);
}
