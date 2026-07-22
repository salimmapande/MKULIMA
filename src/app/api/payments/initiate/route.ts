import { NextRequest, NextResponse } from "next/server";
import {
  createPendingTransaction,
  getPackageById,
  initiateMobilePayment,
} from "@/lib/sms";
import type { MobileMoneyProvider } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { provider, phone, packageId } = (await req.json()) as {
      provider: MobileMoneyProvider;
      phone: string;
      packageId: string;
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

    return NextResponse.json({
      transaction,
      payment,
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
