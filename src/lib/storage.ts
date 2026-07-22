import type { ChatMessage, FarmerProfile, SmsTransaction, WateringAlert } from "./types";

const PROFILE_KEY = "mkulima_profile";
const CHAT_KEY = "mkulima_chat";
const SMS_BALANCE_KEY = "mkulima_sms_balance";
const SMS_TRANSACTIONS_KEY = "mkulima_sms_transactions";
const WATERING_ALERTS_KEY = "mkulima_watering_alerts";

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

export function getSmsBalance(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = localStorage.getItem(SMS_BALANCE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function setSmsBalance(credits: number): void {
  localStorage.setItem(SMS_BALANCE_KEY, String(Math.max(0, credits)));
}

export function addSmsCredits(credits: number): number {
  const newBalance = getSmsBalance() + credits;
  setSmsBalance(newBalance);
  return newBalance;
}

export function deductSmsCredit(): boolean {
  const balance = getSmsBalance();
  if (balance <= 0) return false;
  setSmsBalance(balance - 1);
  return true;
}

export function getSmsTransactions(): SmsTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SMS_TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveSmsTransaction(txn: SmsTransaction): void {
  const txns = getSmsTransactions();
  txns.unshift(txn);
  localStorage.setItem(SMS_TRANSACTIONS_KEY, JSON.stringify(txns.slice(0, 20)));
}

export function updateSmsTransaction(id: string, updates: Partial<SmsTransaction>): void {
  const txns = getSmsTransactions().map((t) => (t.id === id ? { ...t, ...updates } : t));
  localStorage.setItem(SMS_TRANSACTIONS_KEY, JSON.stringify(txns));
}

export function getWateringAlerts(): WateringAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WATERING_ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveWateringAlerts(alerts: WateringAlert[]): void {
  localStorage.setItem(WATERING_ALERTS_KEY, JSON.stringify(alerts));
}
