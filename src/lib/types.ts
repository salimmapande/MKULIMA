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

export type HealthStatus = "healthy" | "moderate" | "unhealthy";
export type PestCategory = "worm" | "bacteria" | "fungus" | "virus" | "nutrient" | "none";

export interface TreatmentProduct {
  name: string;
  nameSw: string;
  type: "insecticide" | "fungicide" | "bactericide" | "organic" | "fertilizer";
  dosage: string;
  dosageSw: string;
}

export interface DiagnosisResult {
  cropName: string;
  cropNameSw: string;
  healthStatus: HealthStatus;
  isHealthy: boolean;
  issue: string;
  confidence: number;
  pestCategory: PestCategory;
  pestOrPathogen: string;
  pestOrPathogenSw: string;
  treatment: string;
  treatmentProducts: TreatmentProduct[];
  prevention: string;
}

export type SoilColor = "red" | "brown" | "black" | "yellow" | "gray";
export type SoilTexture = "clay" | "sandy" | "loam" | "rocky";
export type SoilMoisture = "dry" | "moist" | "wet";

export type FertilityLevel = "high" | "moderate" | "low" | "poor";

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

export interface FertilizerRecommendation {
  name: string;
  nameSw: string;
  type: "chemical" | "organic" | "manure";
  amount: string;
  amountSw: string;
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
  fertilityLevel: FertilityLevel;
  isFertile: boolean;
  confidence: number;
  recommendations: SoilRecommendation[];
  fertilizers: FertilizerRecommendation[];
  improvements: string;
  improvementsSw: string;
}

export type MobileMoneyProvider = "mpesa" | "mixx" | "airtel" | "halotel" | "twilio";

export interface SmsPackage {
  id: string;
  credits: number;
  priceTzs: number;
  label: string;
  labelSw: string;
}

export interface SmsTransaction {
  id: string;
  provider: MobileMoneyProvider;
  packageId: string;
  credits: number;
  amountTzs: number;
  phone: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface WateringAlert {
  id: string;
  crop: CropType;
  enabled: boolean;
  frequencyDays: number;
  preferredTime: string;
  nextAlertAt: string;
  lastSentAt?: string;
}

export interface WateringSchedule {
  crop: CropType;
  cropLabel: string;
  cropLabelSw: string;
  frequencyDays: number;
  preferredTime: string;
  amount: string;
  amountSw: string;
  reason: string;
  reasonSw: string;
}
