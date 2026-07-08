import { NextRequest, NextResponse } from "next/server";
import { generateDiagnosis } from "@/lib/ai";
import type { FarmerProfile } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { profile, image } = (await req.json()) as {
      profile: FarmerProfile;
      image?: string;
    };

    const result = await generateDiagnosis(profile, image);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        issue: "Analysis failed",
        confidence: 0,
        treatment: "Please try again with a clearer photo.",
        prevention: "",
      },
      { status: 500 }
    );
  }
}
