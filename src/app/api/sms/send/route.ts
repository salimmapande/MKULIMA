import { NextRequest, NextResponse } from "next/server";
import { buildWateringSmsMessage, sendSmsViaProvider } from "@/lib/sms";
import type { FarmerProfile, WateringSchedule } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { phone, message, profile, schedule } = (await req.json()) as {
      phone: string;
      message?: string;
      profile?: FarmerProfile;
      schedule?: WateringSchedule;
    };

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    let text = message;
    if (!text && schedule && profile) {
      const isSw = profile.language === "sw";
      text = buildWateringSmsMessage(
        schedule.cropLabel,
        schedule.cropLabelSw,
        schedule.preferredTime,
        schedule.amount,
        schedule.amountSw,
        isSw
      );
    }

    if (!text) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const result = await sendSmsViaProvider(phone, text);
    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "SMS failed" }, { status: 502 });
    }

    return NextResponse.json({ sent: true, messageId: result.messageId });
  } catch {
    return NextResponse.json({ error: "SMS send failed" }, { status: 500 });
  }
}
