"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  Loader2,
  LandPlot,
  Sprout,
  TreeDeciduous,
  Sparkles,
  Shovel,
  FlaskConical,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getProfile } from "@/lib/storage";
import {
  soilColorOptions,
  soilMoistureOptions,
  soilTextureOptions,
} from "@/lib/soil";
import type {
  FarmerProfile,
  FertilityLevel,
  SoilAnalysisResult,
  SoilColor,
  SoilMoisture,
  SoilObservation,
  SoilTexture,
} from "@/lib/types";
import { Card } from "./card";
import { cn } from "@/lib/utils";

const suitabilityStyles = {
  excellent: "bg-forest/15 text-forest border-forest/30",
  good: "bg-sage-light/60 text-moss border-sage",
  moderate: "bg-wheat/25 text-soil border-wheat/40",
};

const suitabilityLabels = {
  excellent: { en: "Excellent", sw: "Bora sana" },
  good: { en: "Good", sw: "Nzuri" },
  moderate: { en: "Moderate", sw: "Wastani" },
};

const fertilityLabels: Record<FertilityLevel, { en: string; sw: string }> = {
  high: { en: "High Fertility", sw: "Rutuba ya Juu" },
  moderate: { en: "Moderate Fertility", sw: "Rutuba ya Wastani" },
  low: { en: "Low Fertility", sw: "Rutuba ya Chini" },
  poor: { en: "Poor Fertility", sw: "Rutuba Duni" },
};

const fertilizerTypeLabels = {
  chemical: { en: "Chemical", sw: "Kikemikali" },
  organic: { en: "Organic", sw: "Asili" },
  manure: { en: "Manure", sw: "Mbolea ya mifugo" },
};

function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  isSw,
}: {
  label: string;
  options: { value: T; en: string; sw: string }[];
  value?: T;
  onChange: (v: T | undefined) => void;
  isSw: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-forest">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(value === opt.value ? undefined : opt.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
              value === opt.value
                ? "border-forest bg-forest text-white shadow-sm"
                : "border-card-border bg-white text-soil-light hover:border-sage"
            )}
          >
            {isSw ? opt.sw : opt.en}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SoilInterface() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<SoilAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [observation, setObservation] = useState<SoilObservation>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const isSw = profile?.language === "sw";

  async function analyze(image: string) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/soil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: profile ?? getProfile(),
          image,
          observation,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      analyze(base64);
    };
    reader.readAsDataURL(file);
  }

  const crops = result?.recommendations.filter((r) => r.type === "crop") ?? [];
  const trees = result?.recommendations.filter((r) => r.type === "tree") ?? [];

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <LandPlot className="h-6 w-6 text-terracotta" />
          <h1 className="font-display text-2xl font-bold text-forest">
            Gundua Ardhi
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          {isSw
            ? "Piga picha ya udongo — AI itachambua aina, rutuba, mbolea na mazao yanayofaa"
            : "Capture your soil — AI analyzes type, fertility, fertilizers and suitable crops"}
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
        <div className="space-y-4">
          <Card className="bg-sage-light/20">
            <ChipSelect
              label={isSw ? "Rangi ya udongo" : "Soil color"}
              options={soilColorOptions}
              value={observation.color}
              onChange={(v) => setObservation((o) => ({ ...o, color: v as SoilColor | undefined }))}
              isSw={isSw}
            />
            <div className="mt-4">
              <ChipSelect
                label={isSw ? "Muundo" : "Texture"}
                options={soilTextureOptions}
                value={observation.texture}
                onChange={(v) =>
                  setObservation((o) => ({ ...o, texture: v as SoilTexture | undefined }))
                }
                isSw={isSw}
              />
            </div>
            <div className="mt-4">
              <ChipSelect
                label={isSw ? "Unyevu" : "Moisture"}
                options={soilMoistureOptions}
                value={observation.moisture}
                onChange={(v) =>
                  setObservation((o) => ({ ...o, moisture: v as SoilMoisture | undefined }))
                }
                isSw={isSw}
              />
            </div>
          </Card>

          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-terracotta/50 bg-terracotta/5 p-10 transition-all hover:border-terracotta hover:bg-terracotta/10"
          >
            <div className="rounded-full bg-terracotta p-4 shadow-md shadow-terracotta/20">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-forest">
                {isSw ? "Piga Picha ya Udongo" : "Photograph Soil"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {isSw
                  ? "Chimba senti 15–20 na piga picha safi ya uso wa udongo au mchanga"
                  : "Dig 15–20 cm and photograph soil or sand cross-section clearly"}
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

          {observation.color && observation.texture && (
            <button
              onClick={() => {
                setPreview("manual");
                analyze("");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-moss py-3 text-sm font-semibold text-white transition-colors hover:bg-forest"
            >
              <Sparkles size={16} />
              {isSw ? "Chambua kwa Uchaguzi" : "Analyze from Selection"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up">
          {preview !== "manual" && (
            <div className="relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Soil sample" className="h-48 w-full object-cover" />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-soil/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-forest" />
                    <span className="text-sm font-medium text-forest">
                      {isSw ? "Inachambua udongo..." : "Analyzing soil..."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {preview === "manual" && loading && (
            <Card className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-forest" />
              <span className="text-sm font-medium text-forest">
                {isSw ? "Inachambua udongo..." : "Analyzing soil..."}
              </span>
            </Card>
          )}

          {preview === "manual" && !loading && result && (
            <Card variant="sage" className="!p-3 text-center text-sm text-forest">
              {isSw ? "Matokeo kulingana na uchaguzi wako" : "Results based on your selection"}
            </Card>
          )}

          {result && !loading && (
            <div className="space-y-3">
              <Card variant="forest">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                      {isSw ? "Aina ya Udongo" : "Soil Type"}
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold">
                      {isSw ? result.soilTypeSw || result.soilType : result.soilType}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed opacity-90">
                      {isSw ? result.descriptionSw || result.description : result.description}
                    </p>
                    <p className="mt-2 text-xs opacity-70">
                      {isSw ? "Uhakika" : "Confidence"}: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card className={result.isFertile ? "bg-forest/5" : "bg-wheat/20"}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {result.isFertile ? (
                      <CheckCircle2 className="h-5 w-5 text-forest" />
                    ) : (
                      <XCircle className="h-5 w-5 text-terracotta" />
                    )}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-forest">
                        {isSw ? "Rutuba ya Udongo" : "Soil Fertility"}
                      </p>
                      <p className="text-sm font-semibold text-soil">
                        {fertilityLabels[result.fertilityLevel]?.[isSw ? "sw" : "en"] ??
                          result.properties.fertility}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      result.isFertile ? "bg-forest/15 text-forest" : "bg-terracotta/15 text-terracotta"
                    )}
                  >
                    {result.isFertile
                      ? isSw
                        ? "Tajiri"
                        : "Fertile"
                      : isSw
                        ? "Inahitaji mbolea"
                        : "Needs fertilizer"}
                  </span>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["pH", result.properties.ph],
                    [isSw ? "Mafereji" : "Drainage", result.properties.drainage],
                    [isSw ? "Rutuba" : "Fertility", result.properties.fertility],
                    [isSw ? "Muundo" : "Texture", result.properties.texture],
                  ] as const
                ).map(([label, value]) => (
                  <Card key={label} className="!p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-soil">{value}</p>
                  </Card>
                ))}
              </div>

              {crops.length > 0 && (
                <RecommendationSection
                  title={isSw ? "Mazao Yanayopendekezwa" : "Recommended Crops"}
                  icon={Sprout}
                  items={crops}
                  isSw={isSw}
                />
              )}

              {trees.length > 0 && (
                <RecommendationSection
                  title={isSw ? "Miti Inayopendekezwa" : "Recommended Trees"}
                  icon={TreeDeciduous}
                  items={trees}
                  isSw={isSw}
                />
              )}

              {result.fertilizers && result.fertilizers.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-terracotta" />
                    <h2 className="font-display text-sm font-semibold text-forest">
                      {isSw ? "Mbolea na Mavure Yanayopendekezwa" : "Recommended Fertilizers & Manure"}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {result.fertilizers.map((f) => (
                      <Card key={f.name} className="!p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-soil">
                              {isSw ? f.nameSw || f.name : f.name}
                            </p>
                            <p className="mt-0.5 text-[10px] font-medium uppercase text-muted">
                              {fertilizerTypeLabels[f.type][isSw ? "sw" : "en"]}
                            </p>
                            <p className="mt-1 text-xs font-medium text-forest">
                              {isSw ? f.amountSw || f.amount : f.amount}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {isSw ? f.reasonSw || f.reason : f.reason}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <Card className="bg-sage-light/30">
                <div className="flex items-start gap-3">
                  <Shovel className="mt-0.5 h-5 w-5 shrink-0 text-moss" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-moss">
                      {isSw ? "Uboreshaji wa Udongo" : "Soil Improvements"}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-soil-light">
                      {isSw ? result.improvementsSw || result.improvements : result.improvements}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <button
            onClick={() => {
              setPreview(null);
              setResult(null);
              setObservation({});
            }}
            className="w-full rounded-xl border border-card-border py-3 text-sm font-medium text-soil transition-colors hover:bg-cream-dark"
          >
            {isSw ? "Chambua Udongo Mwingine" : "Analyze Another Sample"}
          </button>
        </div>
      )}
    </div>
  );
}

function RecommendationSection({
  title,
  icon: Icon,
  items,
  isSw,
}: {
  title: string;
  icon: typeof Sprout;
  items: SoilAnalysisResult["recommendations"];
  isSw: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-forest" />
        <h2 className="font-display text-sm font-semibold text-forest">{title}</h2>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={`${item.type}-${item.name}`} className="!p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-soil">
                    {isSw ? item.nameSw || item.name : item.name}
                  </p>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                      suitabilityStyles[item.suitability]
                    )}
                  >
                    {suitabilityLabels[item.suitability][isSw ? "sw" : "en"]}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {isSw ? item.reasonSw || item.reason : item.reason}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
