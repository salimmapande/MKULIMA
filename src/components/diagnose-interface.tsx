"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Leaf,
  Bug,
  Sprout,
  HeartPulse,
  ShieldAlert,
  FlaskConical,
} from "lucide-react";
import { getProfile } from "@/lib/storage";
import type { DiagnosisResult, FarmerProfile, HealthStatus, PestCategory } from "@/lib/types";
import { Card } from "./card";
import { cn } from "@/lib/utils";

const healthStyles: Record<HealthStatus, string> = {
  healthy: "bg-forest/15 text-forest border-forest/30",
  moderate: "bg-wheat/25 text-soil border-wheat/40",
  unhealthy: "bg-red-100 text-red-800 border-red-200",
};

const healthLabels: Record<HealthStatus, { en: string; sw: string }> = {
  healthy: { en: "Healthy", sw: "Mzima" },
  moderate: { en: "Moderate Stress", sw: "Msongo wa wastani" },
  unhealthy: { en: "Unhealthy", sw: "Si mzima" },
};

const pestLabels: Record<PestCategory, { en: string; sw: string }> = {
  worm: { en: "Worm / Insect", sw: "Mdudu / Sungusungu" },
  bacteria: { en: "Bacterial", sw: "Bakteria" },
  fungus: { en: "Fungal", sw: "Kuvu" },
  virus: { en: "Viral", sw: "Virusi" },
  nutrient: { en: "Nutrient Deficiency", sw: "Upungufu wa virutubisho" },
  none: { en: "None detected", sw: "Hakuna" },
};

const productTypeLabels = {
  insecticide: { en: "Insecticide", sw: "Dawa ya wadudu" },
  fungicide: { en: "Fungicide", sw: "Dawa ya kuvu" },
  bactericide: { en: "Bactericide", sw: "Dawa ya bakteria" },
  organic: { en: "Organic", sw: "Asili" },
  fertilizer: { en: "Fertilizer", sw: "Mbolea" },
};

export function DiagnoseInterface() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const isSw = profile?.language === "sw";

  async function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      setResult(null);
      setLoading(true);

      try {
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: profile ?? getProfile(), image: base64 }),
        });
        const data = await res.json();
        setResult(data);
      } catch {
        setResult({
          cropName: "—",
          cropNameSw: "—",
          healthStatus: "moderate",
          isHealthy: false,
          issue: isSw ? "Imeshindwa kuchambua picha" : "Failed to analyze image",
          confidence: 0,
          pestCategory: "none",
          pestOrPathogen: "",
          pestOrPathogenSw: "",
          treatment: isSw ? "Jaribu tena na picha wazi zaidi." : "Try again with a clearer photo.",
          treatmentProducts: [],
          prevention: "",
        });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Sprout className="h-6 w-6 text-forest" />
          <h1 className="font-display text-2xl font-bold text-forest">
            Gundua Mmea
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          {isSw
            ? "Piga picha ya mmea — AI itatambua aina, afya, wadudu na bakteria"
            : "Photograph your crop — AI identifies type, health, pests and bacteria"}
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {!preview ? (
        <div className="space-y-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-sage bg-sage-light/30 p-10 transition-all hover:border-forest hover:bg-sage-light/50"
          >
            <div className="rounded-full bg-forest p-4">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-forest">
                {isSw ? "Piga Picha ya Mmea" : "Photograph Crop"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {isSw
                  ? "Onyesha majani yaliyoathirika wazi kwa uchambuzi bora"
                  : "Show affected leaves clearly for best analysis"}
              </p>
            </div>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-card-border bg-white py-3 text-sm font-medium text-soil transition-colors hover:bg-cream-dark"
          >
            <Upload size={16} />
            {isSw ? "Pakia Picha" : "Upload Image"}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up">
          <div className="relative overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Crop" className="h-56 w-full object-cover" />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-forest/40 backdrop-blur-sm">
                <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-forest" />
                  <span className="text-sm font-medium text-forest">
                    {isSw ? "Inachambua mmea..." : "Analyzing crop..."}
                  </span>
                </div>
              </div>
            )}
          </div>

          {result && !loading && (
            <div className="space-y-3">
              <Card variant="forest">
                <div className="flex items-start gap-3">
                  <Sprout className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                      {isSw ? "Aina ya Mmea" : "Crop Identified"}
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold">
                      {isSw ? result.cropNameSw || result.cropName : result.cropName}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-forest">
                        {isSw ? "Afya ya Mmea" : "Plant Health"}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-soil-light">
                        {result.isHealthy
                          ? isSw
                            ? "Mmea unaonekana mzima — endelea kufuatilia."
                            : "Plant appears healthy — continue monitoring."
                          : result.issue}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                      healthStyles[result.healthStatus]
                    )}
                  >
                    {healthLabels[result.healthStatus][isSw ? "sw" : "en"]}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {isSw ? "Uhakika" : "Confidence"}: {Math.round(result.confidence * 100)}%
                </p>
              </Card>

              {!result.isHealthy && result.pestCategory !== "none" && (
                <Card className="bg-red-50/50">
                  <div className="flex items-start gap-3">
                    <Bug className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                        {pestLabels[result.pestCategory][isSw ? "sw" : "en"]}
                      </p>
                      <p className="mt-1 font-semibold text-soil">
                        {isSw
                          ? result.pestOrPathogenSw || result.pestOrPathogen
                          : result.pestOrPathogen || result.pestOrPathogenSw}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {!result.isHealthy && (
                <Card>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-forest">
                        {isSw ? "Matibabu" : "Treatment"}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-soil-light">
                        {result.treatment}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {result.treatmentProducts.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-forest" />
                    <h2 className="font-display text-sm font-semibold text-forest">
                      {isSw ? "Dawa Zinazopendekezwa" : "Recommended Products"}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {result.treatmentProducts.map((product) => (
                      <Card key={product.name} className="!p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-soil">
                              {isSw ? product.nameSw || product.name : product.name}
                            </p>
                            <p className="mt-0.5 text-[10px] font-medium uppercase text-muted">
                              {productTypeLabels[product.type][isSw ? "sw" : "en"]}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {isSw ? product.dosageSw || product.dosage : product.dosage}
                            </p>
                          </div>
                          <ShieldAlert className="h-4 w-4 shrink-0 text-terracotta" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {result.prevention && (
                <Card className="bg-sage-light/30">
                  <div className="flex items-start gap-3">
                    <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-moss" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-moss">
                        {isSw ? "Kuzuia" : "Prevention"}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-soil-light">
                        {result.prevention}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {result.isHealthy && (
                <Card className="bg-forest/5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                    <p className="text-sm text-soil-light">
                      {isSw
                        ? "Endelea kufuatilia kila wiki. Piga picha tena ikiwa unaona mabadiliko."
                        : "Continue weekly monitoring. Retake a photo if you notice changes."}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setPreview(null);
              setResult(null);
            }}
            className="w-full rounded-xl border border-card-border py-3 text-sm font-medium text-soil transition-colors hover:bg-cream-dark"
          >
            {isSw ? "Chambua Mmea Mwingine" : "Analyze Another Crop"}
          </button>
        </div>
      )}
    </div>
  );
}
