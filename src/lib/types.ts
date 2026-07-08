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
