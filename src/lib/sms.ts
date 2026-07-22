import type {
  MobileMoneyProvider,
  SmsPackage,
  WateringAlert,
  SmsTransaction,
} from "./types";

export const SMS_PACKAGES: SmsPackage[] = [
  { id: "sms_10", credits: 10, priceTzs: 2000, label: "10 SMS Alerts", labelSw: "Arifa 10 za SMS" },
  { id: "sms_25", credits: 25, priceTzs: 4500, label: "25 SMS Alerts", labelSw: "Arifa 25 za SMS" },
  { id: "sms_50", credits: 50, priceTzs: 8000, label: "50 SMS Alerts", labelSw: "Arifa 50 za SMS" },
  { id: "sms_100", credits: 100, priceTzs: 15000, label: "100 SMS Alerts", labelSw: "Arifa 100 za SMS" },
];

export const MOBILE_MONEY_PROVIDERS: {
  id: MobileMoneyProvider;
  name: string;
  nameSw: string;
  color: string;
  prefix: string;
}[] = [
  { id: "mpesa", name: "M-Pesa", nameSw: "M-Pesa", color: "#E60000", prefix: "Vodacom" },
  { id: "mixx", name: "Mixx by Yas", nameSw: "Mixx by Yas", color: "#0066CC", prefix: "Yas" },
  { id: "airtel", name: "Airtel Money", nameSw: "Airtel Money", color: "#ED1C24", prefix: "Airtel" },
  { id: "halotel", name: "Halotel Money", nameSw: "Halotel Money", color: "#FF6600", prefix: "Halotel" },
];

export function getPackageById(id: string): SmsPackage | undefined {
  return SMS_PACKAGES.find((p) => p.id === id);
}

export function formatTzs(amount: number): string {
  return new Intl.NumberFormat("sw-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
  }).format(amount);
}

export async function sendSmsViaProvider(
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const username = process.env.AFRICAS_TALKING_USERNAME;
  const apiKey = process.env.AFRICAS_TALKING_API_KEY;

  if (username && apiKey) {
    try {
      const normalizedPhone = phone.startsWith("+") ? phone : `+255${phone.replace(/^0/, "")}`;
      const res = await fetch("https://api.africastalking.com/version1/messaging", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          apiKey,
        },
        body: new URLSearchParams({
          username,
          to: normalizedPhone,
          message,
          from: process.env.AFRICAS_TALKING_SENDER_ID ?? "MKULIMA",
        }),
      });

      const data = (await res.json()) as {
        SMSMessageData?: { Recipients?: { status: string; messageId?: string }[] };
      };
      const recipient = data.SMSMessageData?.Recipients?.[0];
      if (recipient?.status === "Success") {
        return { success: true, messageId: recipient.messageId };
      }
      return { success: false, error: recipient?.status ?? "SMS delivery failed" };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "SMS provider error" };
    }
  }

  // Demo mode when no SMS provider configured
  console.log(`[SMS Demo] To: ${phone} | Message: ${message}`);
  return { success: true, messageId: `demo_${Date.now()}` };
}

export function buildWateringSmsMessage(
  cropLabel: string,
  cropLabelSw: string,
  preferredTime: string,
  amount: string,
  amountSw: string,
  isSw: boolean
): string {
  return isSw
    ? `Mkulima: Leo umwagilie ${cropLabelSw} saa ${preferredTime}. Kiasi: ${amountSw}. Bofya mkulima.co.tz kwa maelezo zaidi.`
    : `Mkulima: Water ${cropLabel} today at ${preferredTime}. Amount: ${amount}. Visit mkulima.co.tz for details.`;
}

export function buildPaymentReference(transactionId: string): string {
  return `MKU${transactionId.slice(-8).toUpperCase()}`;
}

export interface PaymentInitResult {
  transactionId: string;
  reference: string;
  provider: MobileMoneyProvider;
  amountTzs: number;
  phone: string;
  status: "pending" | "completed";
  instructions: string;
  instructionsSw: string;
}

export async function initiateMobilePayment(
  provider: MobileMoneyProvider,
  phone: string,
  packageId: string,
  transactionId: string
): Promise<PaymentInitResult> {
  const pkg = getPackageById(packageId);
  if (!pkg) throw new Error("Invalid SMS package");

  const reference = buildPaymentReference(transactionId);
  const normalizedPhone = phone.replace(/\s/g, "");

  const selcomApiKey = process.env.SELCOM_API_KEY;
  const selcomSecret = process.env.SELCOM_API_SECRET;

  if (selcomApiKey && selcomSecret) {
    try {
      const res = await fetch("https://apigw.selcommobile.com/v1/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${selcomApiKey}`,
        },
        body: JSON.stringify({
          vendor: provider === "mpesa" ? "MPESA" : provider === "airtel" ? "AIRTEL" : provider === "halotel" ? "HALOTEL" : "TIGO",
          order_id: reference,
          buyer_email: "farmer@mkulima.co.tz",
          buyer_name: "Mkulima Farmer",
          buyer_phone: normalizedPhone,
          amount: pkg.priceTzs,
          currency: "TZS",
          webhook: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mkulima.co.tz"}/api/payments/webhook`,
        }),
      });

      if (res.ok) {
        const providerNames = { mpesa: "M-Pesa", mixx: "Mixx by Yas", airtel: "Airtel Money", halotel: "Halotel Money" };
        return {
          transactionId,
          reference,
          provider,
          amountTzs: pkg.priceTzs,
          phone: normalizedPhone,
          status: "pending",
          instructions: `Check your phone for ${providerNames[provider]} payment prompt. Enter PIN to confirm ${formatTzs(pkg.priceTzs)}.`,
          instructionsSw: `Angalia simu yako kwa ombi la malipo la ${providerNames[provider]}. Weka PIN kuthibitisha ${formatTzs(pkg.priceTzs)}.`,
        };
      }
    } catch {
      // fall through to demo mode
    }
  }

  const providerNames = {
    mpesa: "M-Pesa (Vodacom)",
    mixx: "Mixx by Yas",
    airtel: "Airtel Money",
    halotel: "Halotel Money",
  };

  return {
    transactionId,
    reference,
    provider,
    amountTzs: pkg.priceTzs,
    phone: normalizedPhone,
    status: "pending",
    instructions: `Demo mode: A ${providerNames[provider]} prompt would appear on ${normalizedPhone} for ${formatTzs(pkg.priceTzs)}. Reference: ${reference}`,
    instructionsSw: `Hali ya majaribio: Ombi la ${providerNames[provider]} lingeonekana kwenye ${normalizedPhone} kwa ${formatTzs(pkg.priceTzs)}. Rejea: ${reference}`,
  };
}

export function createPendingTransaction(
  provider: MobileMoneyProvider,
  packageId: string,
  phone: string
): SmsTransaction {
  const pkg = getPackageById(packageId)!;
  return {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    provider,
    packageId,
    credits: pkg.credits,
    amountTzs: pkg.priceTzs,
    phone,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export function computeNextAlertTime(frequencyDays: number, preferredTime: string): string {
  const [hours, minutes] = preferredTime.split(":").map(Number);
  const next = new Date();
  next.setDate(next.getDate() + frequencyDays);
  next.setHours(hours, minutes, 0, 0);
  if (next <= new Date()) {
    next.setDate(next.getDate() + frequencyDays);
  }
  return next.toISOString();
}

export function defaultWateringAlert(
  crop: WateringAlert["crop"],
  frequencyDays = 3,
  preferredTime = "06:00"
): WateringAlert {
  return {
    id: `alert_${crop}_${Date.now()}`,
    crop,
    enabled: false,
    frequencyDays,
    preferredTime,
    nextAlertAt: computeNextAlertTime(frequencyDays, preferredTime),
  };
}
