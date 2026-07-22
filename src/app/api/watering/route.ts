import { NextRequest, NextResponse } from "next/server";
import { generateWateringSchedulesAI } from "@/lib/ai";
import {
  buildWateringSmsMessage,
  computeNextAlertTime,
  sendSmsViaProvider,
} from "@/lib/sms";
import type { FarmerProfile, WateringSchedule } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { profile, action, schedule, phone } = (await req.json()) as {
      profile: FarmerProfile;
      action?: "schedule" | "send_alert";
      schedule?: WateringSchedule;
      phone?: string;
    };

    if (action === "send_alert" && schedule && phone) {
      const isSw = profile.language === "sw";
      const message = buildWateringSmsMessage(
        schedule.cropLabel,
        schedule.cropLabelSw,
        schedule.preferredTime,
        schedule.amount,
        schedule.amountSw,
        isSw
      );

      const result = await sendSmsViaProvider(phone, message);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 502 });
      }

      return NextResponse.json({
        sent: true,
        messageId: result.messageId,
        nextAlertAt: computeNextAlertTime(schedule.frequencyDays, schedule.preferredTime),
      });
    }

    const schedules = await generateWateringSchedulesAI(profile);
    return NextResponse.json({ schedules });
  } catch {
    return NextResponse.json({ schedules: [], error: "Failed to generate schedule" }, { status: 500 });
  }
}
