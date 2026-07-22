import type {
  FertilizerRecommendation,
  FertilityLevel,
  SoilAnalysisResult,
  SoilColor,
  SoilMoisture,
  SoilObservation,
  SoilRecommendation,
  SoilTexture,
} from "./types";

export const soilColorOptions: { value: SoilColor; en: string; sw: string }[] = [
  { value: "red", en: "Red", sw: "Mwekundu" },
  { value: "brown", en: "Brown", sw: "Kahawia" },
  { value: "black", en: "Black", sw: "Nyeusi" },
  { value: "yellow", en: "Yellow / Sandy", sw: "Njano / Mchanga" },
  { value: "gray", en: "Gray", sw: "Kijivu" },
];

export const soilTextureOptions: { value: SoilTexture; en: string; sw: string }[] = [
  { value: "clay", en: "Clay", sw: "Udongo" },
  { value: "sandy", en: "Sandy", sw: "Mchanga" },
  { value: "loam", en: "Loam", sw: "Tutokano" },
  { value: "rocky", en: "Rocky", sw: "Mawe" },
];

export const soilMoistureOptions: { value: SoilMoisture; en: string; sw: string }[] = [
  { value: "dry", en: "Dry", sw: "Kavu" },
  { value: "moist", en: "Moist", sw: "Unyevu" },
  { value: "wet", en: "Wet", sw: "Mvua / Maji" },
];

const suitabilityOrder = { excellent: 0, good: 1, moderate: 2 };

function defaultFertilizers(isLow: boolean): FertilizerRecommendation[] {
  if (!isLow) return [];
  const items: FertilizerRecommendation[] = [
    {
      name: "DAP (Di-Ammonium Phosphate)",
      nameSw: "DAP",
      type: "chemical",
      amount: "200 kg per hectare at planting",
      amountSw: "kg 200 kwa kila ekari wakati wa kupanda",
      reason: "Boosts phosphorus for root development.",
      reasonSw: "Huongeza fosforasi kwa ukuaji wa mizizi.",
    },
    {
      name: "Compost / Farmyard Manure",
      nameSw: "Komposti / Mbolea ya Asili",
      type: "manure",
      amount: "5–10 tonnes per hectare before planting",
      amountSw: "toni 5–10 kwa kila ekari kabla ya kupanda",
      reason: "Improves organic matter and water retention.",
      reasonSw: "Huboresha rutuba na kuhifadhi maji.",
    },
    {
      name: "CAN (Calcium Ammonium Nitrate)",
      nameSw: "CAN",
      type: "chemical",
      amount: "100 kg per hectare as top-dress",
      amountSw: "kg 100 kwa kila ekari kama mbolea ya juu",
      reason: "Supplies nitrogen during crop growth.",
      reasonSw: "Hutoa nitrogen wakati wa ukuaji wa mazao.",
    },
  ];
  return items;
}

function rec(
  name: string,
  nameSw: string,
  type: "crop" | "tree",
  suitability: SoilRecommendation["suitability"],
  reason: string,
  reasonSw: string
): SoilRecommendation {
  return { name, nameSw, type, suitability, reason, reasonSw };
}

export function fallbackSoilAnalysis(
  observation: SoilObservation,
  isSw: boolean
): SoilAnalysisResult {
  const { color = "brown", texture = "loam", moisture = "moist" } = observation;

  const profiles: Record<
    string,
    Omit<SoilAnalysisResult, "confidence" | "fertilityLevel" | "isFertile" | "fertilizers">
  > = {
    "red-loam": {
      soilType: "Red loamy soil (Ferralsol)",
      soilTypeSw: "Udongo mwekundu wa tutokano",
      description:
        "Common across Tanzania's highlands and plateaus. Good structure, moderate fertility, responds well to organic matter.",
      descriptionSw:
        "Kawaida katika milima na plateaus za Tanzania. Muundo mzuri, rutuba ya wastani, huitikia mbolea ya asili.",
      properties: { ph: "5.5–6.5", drainage: "Good", fertility: "Moderate", texture: "Loam" },
      recommendations: [
        rec("Maize", "Mahindi", "crop", "excellent", "Thrives in red loams with proper fertilization.", "Hustawi kwenye udongo mwekundu wa tutokano na mbolea."),
        rec("Beans", "Maharage", "crop", "excellent", "Fixes nitrogen; ideal intercrop.", "Hurekebisha nitrogen; mzuri kwa kupanda pamoja."),
        rec("Coffee", "Kahawa", "tree", "good", "Suitable in highland red soils with shade.", "Unafaa kwenye udongo wa milima wenye kivuli."),
        rec("Avocado", "Parachichi", "tree", "good", "Deep roots suit well-drained red loam.", "Mizizi mirefu inafaa udongo unaotokomeza maji."),
        rec("Cassava", "Mihogo", "crop", "good", "Tolerates moderate fertility.", "Hustahimili rutuba ya wastani."),
        rec("Mango", "Embe", "tree", "moderate", "Needs compost for best yield.", "Inahitaji komposti kwa mavuno bora."),
      ],
      improvements: "Add compost or farmyard manure before planting. Lime if pH is below 5.5.",
      improvementsSw: "Ongeza komposti au mbolea ya asili kabla ya kupanda. Ongeza chokaa ikiwa pH ni chini ya 5.5.",
    },
    "red-clay": {
      soilType: "Red clay soil",
      soilTypeSw: "Udongo mwekundu wa udongo",
      description: "Heavy clay with good mineral content but slow drainage. Common in Morogoro and Iringa.",
      descriptionSw: "Udongo mzito wenye madini mengi lakini maji yanachelewa kutoka. Kawaida Morogoro na Iringa.",
      properties: { ph: "6.0–7.0", drainage: "Slow", fertility: "Moderate–High", texture: "Clay" },
      recommendations: [
        rec("Rice", "Mchele", "crop", "excellent", "Ideal where water can be retained.", "Bora pale maji yanaweza kuhifadhiwa."),
        rec("Cotton", "Pamba", "crop", "good", "Suits heavy clay in warm areas.", "Unafaa udongo mzito katika maeneo ya joto."),
        rec("Cassava", "Mihogo", "crop", "good", "Handles clay and low inputs well.", "Hustahimili udongo mzito na pembejeo kidogo."),
        rec("Banana", "Ndizi", "tree", "good", "Likes moisture-retaining clay soils.", "Inapenda udongo unaohifadhi unyevu."),
        rec("Maize", "Mahindi", "crop", "moderate", "Needs ridges for drainage.", "Inahitaji matuta kwa mafereji."),
      ],
      improvements: "Build ridges or raised beds. Mix in sand and compost to improve drainage.",
      improvementsSw: "Tengeneza matuta au vitanda virefu. Changanya mchanga na komposti kuboresha mafereji.",
    },
    "black-clay": {
      soilType: "Black cotton soil (Vertisol)",
      soilTypeSw: "Udongo nyeusi wa pamba",
      description: "Rich but cracks when dry. Found in parts of Dodoma, Singida, and Shinyanga.",
      descriptionSw: "Tajiri lakini unapasuka ukikauka. Unapatikana Dodoma, Singida, na Shinyanga.",
      properties: { ph: "7.0–8.5", drainage: "Poor when wet", fertility: "High", texture: "Clay" },
      recommendations: [
        rec("Cotton", "Pamba", "crop", "excellent", "Classic crop for black cotton soils.", "Zao la kawaida kwa udongo nyeusi wa pamba."),
        rec("Sorghum", "Mtama", "crop", "excellent", "Drought-tolerant after establishment.", "Hustahimili ukame baada ya kuanza kukua."),
        rec("Sunflower", "Alizeti", "crop", "good", "Handles alkaline black soils.", "Hustahimili udongo nyeusi wenye alikali."),
        rec("Sesame", "Ufuta", "crop", "good", "Suits warm black soil regions.", "Unafaa maeneo ya joto yenye udongo nyeusi."),
        rec("Neem", "Mwarubaini", "tree", "moderate", "Hardy tree for semi-arid black soils.", "Mti imara kwa udongo nyeusi wa ukame."),
      ],
      improvements: "Plant immediately after rains. Avoid working soil when too wet or too dry.",
      improvementsSw: "Panda mara baada ya mvua. Epuka kulima udongo ukiwa na unyevu mwingi au ukikauka.",
    },
    "yellow-sandy": {
      soilType: "Sandy soil",
      soilTypeSw: "Udongo wa mchanga",
      description: "Light, drains fast, low water and nutrient retention. Common in coastal Pwani and Lindi.",
      descriptionSw: "Mwepesi, maji yanatoka haraka, huhifadhi virutubisho. Kawaida Pwani na Lindi.",
      properties: { ph: "5.0–6.5", drainage: "Excellent", fertility: "Low", texture: "Sandy" },
      recommendations: [
        rec("Groundnuts", "Karanga", "crop", "excellent", "Classic sandy-soil crop in Tanzania.", "Zao bora la udongo wa mchanga Tanzania."),
        rec("Sweet potato", "Viazi vitamu", "crop", "excellent", "Spreads well in loose sand.", "Huenea vizuri kwenye mchanga."),
        rec("Watermelon", "Tikiti maji", "crop", "good", "Likes warm, well-drained sand.", "Inapenda mchanga wa joto unaotokomeza maji."),
        rec("Cashew", "Korosho", "tree", "excellent", "Coastal sandy soils are ideal.", "Mchanga wa pwani unafaa sana."),
        rec("Cassava", "Mihogo", "crop", "good", "Low input crop for poor sands.", "Zao la pembejeo kidogo kwa mchanga duni."),
        rec("Coconut", "Nazi", "tree", "good", "Coastal sandy areas.", "Maeneo ya mchanga pwani."),
      ],
      improvements: "Add heavy compost and mulch. Drip irrigation recommended. Plant cover crops.",
      improvementsSw: "Ongeza komposti nyingi na matandaza. Umwagiliaji wa matone unashauriwa. Panda mazao ya kufunika udongo.",
    },
    "brown-loam": {
      soilType: "Brown loam",
      soilTypeSw: "Udongo kahawia wa tutokano",
      description: "Balanced soil — versatile for many crops. Typical of well-managed Tanzanian farmland.",
      descriptionSw: "Udongo wenye usawaziko — unafaa mazao mengi. Kawaida kwa mashamba yaliyolimwa vizuri Tanzania.",
      properties: { ph: "6.0–7.0", drainage: "Good", fertility: "Moderate–High", texture: "Loam" },
      recommendations: [
        rec("Maize", "Mahindi", "crop", "excellent", "Ideal staple for loam soils.", "Chakula kikuu bora kwa udongo wa tutokano."),
        rec("Tomatoes", "Nyanya", "crop", "excellent", "High value on fertile loam.", "Thamani kubwa kwenye tutokano tajiri."),
        rec("Beans", "Maharage", "crop", "excellent", "Excellent rotation partner.", "Mshirika mzuri wa kuchanganya mazao."),
        rec("Coffee", "Kahawa", "tree", "good", "With shade and organic inputs.", "Kwa kivuli na mbolea ya asili."),
        rec("Macadamia", "Macadamia", "tree", "good", "Growing export crop on good loam.", "Zao la kuuza nje linalokua kwenye tutokano."),
        rec("Tea", "Chai", "tree", "moderate", "Needs highland loam and rainfall.", "Inahitaji tutokano wa milima na mvua."),
      ],
      improvements: "Maintain organic matter with crop rotation and compost. Test soil every 2–3 seasons.",
      improvementsSw: "Hifadhi rutuba kwa kuchanganya mazao na komposti. Pima udongo kila misimu 2-3.",
    },
  };

  const key = `${color}-${texture}`;
  const fallbackKey =
    profiles[key] ? key :
    texture === "sandy" ? "yellow-sandy" :
    texture === "clay" && color === "black" ? "black-clay" :
    color === "red" ? "red-loam" :
    "brown-loam";

  const base = profiles[fallbackKey];
  const profile = {
    ...base,
    recommendations: [...base.recommendations],
  };
  let confidence = 0.68;

  if (observation.color && observation.texture) confidence = 0.78;
  if (observation.color && observation.texture && observation.moisture) confidence = 0.82;

  if (moisture === "wet" && texture !== "clay") {
    profile.recommendations = [
      rec("Rice", "Mchele", "crop", "excellent", "Wet soils suit paddy rice.", "Udongo wenye maji unafaa mchele."),
      ...profile.recommendations.filter((r) => r.name !== "Rice"),
    ];
  }

  profile.recommendations.sort(
    (a, b) => suitabilityOrder[a.suitability] - suitabilityOrder[b.suitability]
  );

  const fertilityMeta: Record<string, { fertilityLevel: FertilityLevel; isFertile: boolean }> = {
    "red-loam": { fertilityLevel: "moderate", isFertile: true },
    "red-clay": { fertilityLevel: "moderate", isFertile: true },
    "black-clay": { fertilityLevel: "high", isFertile: true },
    "yellow-sandy": { fertilityLevel: "low", isFertile: false },
    "brown-loam": { fertilityLevel: "high", isFertile: true },
  };

  const meta = fertilityMeta[fallbackKey] ?? { fertilityLevel: "moderate" as FertilityLevel, isFertile: true };
  const fertilizers = defaultFertilizers(!meta.isFertile);

  if (isSw) {
    return {
      ...profile,
      ...meta,
      fertilizers,
      confidence,
      soilType: profile.soilTypeSw,
      description: profile.descriptionSw,
      improvements: profile.improvementsSw,
      properties: {
        ...profile.properties,
        drainage:
          profile.properties.drainage === "Good" ? "Nzuri" :
          profile.properties.drainage === "Slow" ? "Polepole" :
          profile.properties.drainage === "Excellent" ? "Bora sana" :
          profile.properties.drainage,
        fertility:
          profile.properties.fertility === "Moderate" ? "Wastani" :
          profile.properties.fertility === "Low" ? "Chini" :
          profile.properties.fertility.includes("High") ? "Juu" :
          profile.properties.fertility,
      },
    };
  }

  return { ...profile, ...meta, fertilizers, confidence };
}
