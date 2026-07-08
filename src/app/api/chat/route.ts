import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai";
import type { FarmerProfile } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { profile, messages } = (await req.json()) as {
      profile: FarmerProfile;
      messages: { role: string; content: string }[];
    };

    const reply = await generateChatResponse({ profile, messages });
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "Sorry, I couldn't process your request. Please try again." },
      { status: 500 }
    );
  }
}
