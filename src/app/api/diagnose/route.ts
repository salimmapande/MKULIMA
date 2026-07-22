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
        cropName: "Unknown",
        cropNameSw: "Haijulikani",
        healthStatus: "moderate",
        isHealthy: false,
        issue: "Analysis failed",
        confidence: 0,
        pestCategory: "none",
        pestOrPathogen: "",
        pestOrPathogenSw: "",
        treatment: "Please try again with a clearer photo.",
        treatmentProducts: [],
        prevention: "",
      },
      { status: 500 }
    );
  }
}
