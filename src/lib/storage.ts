import type { ChatMessage, FarmerProfile } from "./types";

const PROFILE_KEY = "mkulima_profile";
const CHAT_KEY = "mkulima_chat";

export const defaultProfile: FarmerProfile = {
  name: "",
  location: "",
  region: "",
  farmSize: "",
  crops: [],
  language: "sw",
  phone: "",
};

export function getProfile(): FarmerProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return defaultProfile;
    const parsed = JSON.parse(stored) as Partial<FarmerProfile> & { county?: string };
    if (parsed.county && !parsed.region) {
      parsed.region = parsed.county;
    }
    return { ...defaultProfile, ...parsed };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: FarmerProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CHAT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
}

export function clearChatHistory(): void {
  localStorage.removeItem(CHAT_KEY);
}
