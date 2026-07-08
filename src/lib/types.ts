export type Language = "sw" | "en";

export type CropType =
  | "maize"
  | "beans"
  | "coffee"
  | "tea"
  | "tomatoes"
  | "potatoes"
  | "cassava"
  | "sorghum";

export interface FarmerProfile {
  name: string;
  location: string;
  region: string;
  farmSize: string;
  crops: CropType[];
  language: Language;
  phone: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CalendarTask {
  id: string;
  title: string;
  titleSw: string;
  description: string;
  descriptionSw: string;
  month: number;
  crop: CropType | "all";
  priority: "high" | "medium" | "low";
}

export interface WeatherTip {
  condition: string;
  tip: string;
  tipSw: string;
  icon: "sun" | "cloud" | "rain" | "wind";
}

export interface DiagnosisResult {
  issue: string;
  confidence: number;
  treatment: string;
  prevention: string;
}

export type SoilColor = "red" | "brown" | "black" | "yellow" | "gray";
export type SoilTexture = "clay" | "sandy" | "loam" | "rocky";
export type SoilMoisture = "dry" | "moist" | "wet";

export interface SoilObservation {
  color?: SoilColor;
  texture?: SoilTexture;
  moisture?: SoilMoisture;
}

export interface SoilRecommendation {
  name: string;
  nameSw: string;
  type: "crop" | "tree";
  suitability: "excellent" | "good" | "moderate";
  reason: string;
  reasonSw: string;
}

export interface SoilAnalysisResult {
  soilType: string;
  soilTypeSw: string;
  description: string;
  descriptionSw: string;
  properties: {
    ph: string;
    drainage: string;
    fertility: string;
    texture: string;
  };
  confidence: number;
  recommendations: SoilRecommendation[];
  improvements: string;
  improvementsSw: string;
}
