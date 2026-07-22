import { NextRequest, NextResponse } from "next/server";
import { getPackageById } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, result, transid } = body as {
      order_id?: string;
      result?: string;
      transid?: string;
      amount?: number;
    };

    if (result === "SUCCESS" && order_id) {
      return NextResponse.json({
        received: true,
        order_id,
        transid,
        status: "completed",
      });
    }

    if (process.env.PAYMENT_DEMO_MODE === "true" && body.transactionId && body.packageId) {
      const pkg = getPackageById(body.packageId as string);
      if (pkg) {
        return NextResponse.json({
          received: true,
          status: "completed",
          credits: pkg.credits,
          transactionId: body.transactionId,
        });
      }
    }

    return NextResponse.json({ received: true, status: "pending" });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
