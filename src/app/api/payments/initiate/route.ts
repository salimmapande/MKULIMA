import { NextRequest, NextResponse } from "next/server";
import {
  buildPurchaseConfirmationSms,
  createPendingTransaction,
  getPackageById,
  initiateMobilePayment,
  sendSmsViaTwilio,
} from "@/lib/sms";
import type { MobileMoneyProvider } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { provider, phone, packageId, language } = (await req.json()) as {
      provider: MobileMoneyProvider;
      phone: string;
      packageId: string;
      language?: "sw" | "en";
    };

    if (!provider || !phone || !packageId) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const pkg = getPackageById(packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Invalid SMS package" }, { status: 400 });
    }

    const transaction = createPendingTransaction(provider, packageId, phone);
    const payment = await initiateMobilePayment(provider, phone, packageId, transaction.id);

    if (provider === "twilio") {
      const isSw = language === "sw";
      const confirmation = buildPurchaseConfirmationSms(pkg.credits, pkg.credits, isSw);
      const smsResult = await sendSmsViaTwilio(phone, confirmation);

      return NextResponse.json({
        transaction: { ...transaction, status: "completed" as const },
        payment: { ...payment, status: "completed" as const },
        instantComplete: true,
        credits: pkg.credits,
        smsSent: smsResult.success,
        message: isSw
          ? `Ununuzi umekamilika! SMS ${pkg.credits} zimeongezwa.${smsResult.success ? " Uthibitisho umetumwa kwa simu yako." : ""}`
          : `Purchase complete! ${pkg.credits} SMS credits added.${smsResult.success ? " Confirmation sent to your phone." : ""}`,
      });
    }

    return NextResponse.json({
      transaction,
      payment,
      instantComplete: false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment initiation failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { transactionId, status } = (await req.json()) as {
      transactionId: string;
      status: "completed" | "failed";
    };

    if (status === "completed") {
      return NextResponse.json({ confirmed: true, transactionId });
    }

    return NextResponse.json({ confirmed: false, transactionId });
  } catch {
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
