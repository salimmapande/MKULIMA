import { NextRequest, NextResponse } from "next/server";
import { generateSoilAnalysis } from "@/lib/ai";
import type { FarmerProfile, SoilObservation } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { profile, image, observation } = (await req.json()) as {
      profile: FarmerProfile;
      image?: string;
      observation?: SoilObservation;
    };

    const result = await generateSoilAnalysis(profile, image, observation ?? {});
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        soilType: "Unknown",
        soilTypeSw: "Haijulikani",
        description: "Could not analyze soil. Try again with a clearer photo.",
        descriptionSw: "Imeshindwa kuchambua udongo. Jaribu tena na picha wazi.",
        properties: { ph: "—", drainage: "—", fertility: "—", texture: "—" },
        confidence: 0,
        recommendations: [],
        improvements: "",
        improvementsSw: "",
      },
      { status: 500 }
    );
  }
}
