import type { FarmerProfile, SoilAnalysisResult, SoilObservation, WateringSchedule } from "./types";
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

const diagnosisSchema = `{
  "cropName": "English crop/plant name identified",
  "cropNameSw": "Swahili crop/plant name",
  "healthStatus": "healthy|moderate|unhealthy",
  "isHealthy": true|false,
  "issue": "Brief issue description or 'Plant appears healthy'",
  "confidence": 0.0-1.0,
  "pestCategory": "worm|bacteria|fungus|virus|nutrient|none",
  "pestOrPathogen": "English name of pest, worm, bacteria, or pathogen (empty if healthy)",
  "pestOrPathogenSw": "Swahili name",
  "treatment": "Detailed treatment steps",
  "treatmentProducts": [
    {"name":"Product name","nameSw":"Swahili","type":"insecticide|fungicide|bactericide|organic|fertilizer","dosage":"English dosage","dosageSw":"Swahili dosage"}
  ],
  "prevention": "Prevention advice"
}`;

export async function generateDiagnosis(
  profile: FarmerProfile,
  imageBase64?: string
): Promise<import("./types").DiagnosisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && imageBase64) {
    try {
      const lang = profile.language === "sw" ? "Swahili" : "English";
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
              content: `You are an expert agricultural plant pathologist and entomologist for Tanzania.
Analyze crop/plant images with camera-grade precision.

Tasks:
1. Identify the crop or plantation type (maize, coffee, tomatoes, cassava, etc.)
2. Assess overall plant health (healthy, moderate stress, or unhealthy/diseased)
3. If unhealthy: identify the specific worm, bacteria, fungus, virus, or nutrient deficiency
4. Recommend specific anti-worm, anti-bacteria, or fungicide products available in Tanzania (e.g. Duduthrin, Belt, Ridomil, Copper oxychloride, neem oil, Bt)
5. Include dosage per hectare or per plant as appropriate

Respond in JSON only:
${diagnosisSchema}

Language for text fields: ${lang}. Be practical for Tanzanian smallholder farmers.
Reference TOSCI-approved products where possible.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this crop/plant for a farmer in ${profile.region || "Tanzania"}. Identify crop type, health status, and any pests or pathogens.`,
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
          const parsed = JSON.parse(match[0]) as import("./types").DiagnosisResult;
          if (parsed.cropName) return parsed;
        }
      }
    } catch {
      // fall through
    }
  }

  return fallbackDiagnosis(profile);
}

function fallbackDiagnosis(profile: FarmerProfile): import("./types").DiagnosisResult {
  const isSw = profile.language === "sw";
  const primaryCrop = profile.crops[0];
  const cropName = primaryCrop ? cropLabels[primaryCrop].en : "Crop";
  const cropNameSw = primaryCrop ? cropLabels[primaryCrop].sw : "Mmea";

  return {
    cropName,
    cropNameSw,
    healthStatus: "moderate",
    isHealthy: false,
    issue: isSw
      ? "Dalili zinaweza kuwa ugonjwa wa majani, wadudu, au upungufu wa virutubisho"
      : "Symptoms may indicate leaf blight, pest damage, or nutrient deficiency",
    confidence: 0.72,
    pestCategory: "fungus",
    pestOrPathogen: isSw ? "" : "Leaf blight / fungal infection",
    pestOrPathogenSw: "Ugonjwa wa kuvu wa majani",
    treatment: isSw
      ? "Ondoa majani yaliyoathirika. Nyunyiza Ridomil Gold au dawa ya kuvu inayopendekezwa. Ongeza mbolea ya kompost."
      : "Remove affected leaves. Spray Ridomil Gold or recommended fungicide. Top-dress with compost or organic matter.",
    treatmentProducts: [
      {
        name: "Ridomil Gold MZ",
        nameSw: "Ridomil Gold MZ",
        type: "fungicide",
        dosage: isSw ? "" : "2.5 kg/ha mixed with 200L water",
        dosageSw: "2.5 kg/ekari changanywa na lita 200 za maji",
      },
      {
        name: "Neem oil (organic)",
        nameSw: "Mafuta ya Mwarubaini",
        type: "organic",
        dosage: isSw ? "" : "5ml per litre of water, spray weekly",
        dosageSw: "5ml kwa kila lita ya maji, nyunyiza kila wiki",
      },
    ],
    prevention: isSw
      ? "Panda mbegu safi zenye cheti cha TOSCI, tumia mbinu za kuchanganya mazao, na fuata ratiba ya kupalilia."
      : "Use TOSCI-certified seed, rotate crops, and maintain regular weeding and field hygiene.",
  };
}

export function getWeatherTips(isSw: boolean) {
  const month = new Date().getMonth() + 1;

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

const soilSchema = `{
  "soilType": "English name (e.g. Sandy loam, Ferralsol, Vertisol)",
  "soilTypeSw": "Swahili name",
  "description": "English description of soil characteristics",
  "descriptionSw": "Swahili description",
  "properties": {"ph":"...","drainage":"...","fertility":"...","texture":"..."},
  "fertilityLevel": "high|moderate|low|poor",
  "isFertile": true|false,
  "confidence": 0.0-1.0,
  "recommendations": [
    {"name":"...","nameSw":"...","type":"crop|tree","suitability":"excellent|good|moderate","reason":"...","reasonSw":"..."}
  ],
  "fertilizers": [
    {"name":"DAP/CAN/compost etc","nameSw":"...","type":"chemical|organic|manure","amount":"English amount per hectare","amountSw":"Swahili amount","reason":"...","reasonSw":"..."}
  ],
  "improvements": "English soil improvement advice",
  "improvementsSw": "Swahili soil improvement advice"
}`;

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
              content: `You are a soil scientist and agronomist for Tanzania. Analyze soil photos from camera captures with precision.

Tasks:
1. Identify soil type (clay, sandy, loam, sand, black cotton, red ferralsol, etc.)
2. Assess fertility level (high, moderate, low, poor)
3. Determine if soil is fertile enough for farming or needs improvement
4. Recommend 4-6 crops and trees suited to this soil in Tanzania
5. If NOT fertile: recommend specific fertilizers (DAP, CAN, Urea, TSP) and manure (cow, chicken, compost) with amounts per hectare

Respond in JSON only:
${soilSchema}

Include 4-6 recommendations (mix of crops and trees) suited to Tanzanian regions.
Consider region: ${profile.region || "Tanzania"}, location: ${profile.location || "unknown"}.
Farmer observations: ${observationSummary(observation)}.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this soil sample photo and recommend crops, trees, and fertilizers for a farmer in ${profile.region || "Tanzania"}.`,
                },
                { type: "image_url", image_url: { url: imageBase64 } },
              ],
            },
          ],
          max_tokens: 1200,
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

export function generateWateringSchedules(
  profile: FarmerProfile
): WateringSchedule[] {
  const isSw = profile.language === "sw";
  const month = new Date().getMonth() + 1;
  const isDrySeason = month >= 6 && month <= 10;
  const crops = profile.crops.length ? profile.crops : (["maize"] as const);

  const schedules: Record<string, Omit<WateringSchedule, "crop">> = {
    maize: {
      cropLabel: "Maize",
      cropLabelSw: "Mahindi",
      frequencyDays: isDrySeason ? 3 : 7,
      preferredTime: "06:00",
      amount: isDrySeason ? "20–25 mm per session" : "Rely on rainfall; irrigate if 7+ days dry",
      amountSw: isDrySeason ? "20–25 mm kwa kila umwagiliaji" : "Tegemea mvua; umwagilia ikiwa siku 7+ bila mvua",
      reason: isDrySeason
        ? "Maize needs regular water during tasseling and grain fill in dry season."
        : "During rains, only irrigate during dry spells.",
      reasonSw: isDrySeason
        ? "Mahindi yanahitaji maji ya mara kwa mara wakati wa kuchanua na kujaa nafaka."
        : "Wakati wa mvua, umwagilia tu wakati wa ukame.",
    },
    tomatoes: {
      cropLabel: "Tomatoes",
      cropLabelSw: "Nyanya",
      frequencyDays: isDrySeason ? 2 : 5,
      preferredTime: "06:30",
      amount: "15–20 mm; avoid wetting leaves",
      amountSw: "15–20 mm; epuka kunyunyiza majani",
      reason: "Tomatoes need consistent moisture; irregular watering causes blossom end rot.",
      reasonSw: "Nyanya zinahitaji unyevu thabiti; ukosefu wa maji husababisha kuoza.",
    },
    coffee: {
      cropLabel: "Coffee",
      cropLabelSw: "Kahawa",
      frequencyDays: isDrySeason ? 5 : 10,
      preferredTime: "07:00",
      amount: "25 mm per session during dry months",
      amountSw: "25 mm kwa kila umwagiliaji wakati wa kiangazi",
      reason: "Coffee needs water during flowering (Feb–Mar) and bean development.",
      reasonSw: "Kahawa inahitaji maji wakati wa kuchanua na ukuaji wa punje.",
    },
    beans: {
      cropLabel: "Beans",
      cropLabelSw: "Maharage",
      frequencyDays: isDrySeason ? 4 : 7,
      preferredTime: "06:00",
      amount: "15 mm; critical at flowering",
      amountSw: "15 mm; muhimu wakati wa kuchanua",
      reason: "Beans are sensitive to drought at flowering and pod fill.",
      reasonSw: "Maharage yanahitaji maji wakati wa kuchanua na kujaa.",
    },
    cassava: {
      cropLabel: "Cassava",
      cropLabelSw: "Mihogo",
      frequencyDays: isDrySeason ? 7 : 14,
      preferredTime: "07:00",
      amount: "20 mm during first 3 months only",
      amountSw: "20 mm kwa miezi 3 ya kwanza tu",
      reason: "Cassava is drought-tolerant after establishment.",
      reasonSw: "Mihogo hustahimili ukame baada ya kuanza kukua.",
    },
    potatoes: {
      cropLabel: "Potatoes",
      cropLabelSw: "Viazi",
      frequencyDays: isDrySeason ? 3 : 6,
      preferredTime: "06:00",
      amount: "20–25 mm; maintain even moisture",
      amountSw: "20–25 mm; hifadhi unyevu sawa",
      reason: "Potatoes need steady moisture for tuber development.",
      reasonSw: "Viazi vinahitaji unyevu thabiti kwa ukuaji wa viazi.",
    },
    tea: {
      cropLabel: "Tea",
      cropLabelSw: "Chai",
      frequencyDays: isDrySeason ? 4 : 8,
      preferredTime: "06:30",
      amount: "25 mm in dry season",
      amountSw: "25 mm wakati wa kiangazi",
      reason: "Tea bushes need consistent moisture year-round in highland areas.",
      reasonSw: "Chai inahitaji unyevu wa mara kwa mara katika maeneo ya milima.",
    },
    sorghum: {
      cropLabel: "Sorghum",
      cropLabelSw: "Mtama",
      frequencyDays: isDrySeason ? 5 : 10,
      preferredTime: "06:00",
      amount: "15 mm during heading stage",
      amountSw: "15 mm wakati wa kuchanua",
      reason: "Sorghum is drought-tolerant but benefits from water at heading.",
      reasonSw: "Mtama hustahimili ukame lakini unahitaji maji wakati wa kuchanua.",
    },
  };

  return crops.map((crop) => ({
    crop,
    ...schedules[crop],
  }));
}

export async function generateWateringSchedulesAI(
  profile: FarmerProfile
): Promise<WateringSchedule[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  const local = generateWateringSchedules(profile);

  if (!apiKey || !profile.crops.length) return local;

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
            content: `You are an irrigation advisor for Tanzania. Generate watering schedules for farmer crops.
Current month: ${new Date().getMonth() + 1}. Region: ${profile.region || "Tanzania"}.
Respond JSON array only:
[{"crop":"maize|beans|...","cropLabel":"...","cropLabelSw":"...","frequencyDays":3,"preferredTime":"06:00","amount":"...","amountSw":"...","reason":"...","reasonSw":"..."}]`,
          },
          {
            role: "user",
            content: `Crops: ${profile.crops.join(", ")}. Farm: ${profile.farmSize || "smallholder"}.`,
          },
        ],
        max_tokens: 800,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices[0]?.message?.content ?? "";
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as WateringSchedule[];
        if (parsed.length) return parsed;
      }
    }
  } catch {
    // fall through
  }

  return local;
}
