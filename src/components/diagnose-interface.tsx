"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Loader2, AlertCircle, CheckCircle2, Leaf } from "lucide-react";
import { getProfile } from "@/lib/storage";
import type { DiagnosisResult, FarmerProfile } from "@/lib/types";
import { Card } from "./card";

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
          issue: isSw ? "Imeshindwa kuchambua picha" : "Failed to analyze image",
          confidence: 0,
          treatment: isSw ? "Jaribu tena na picha wazi zaidi." : "Try again with a clearer photo.",
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
        <h1 className="font-display text-2xl font-bold text-forest">
          {isSw ? "Gundua Tatizo" : "Crop Diagnosis"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isSw
            ? "Piga picha ya mmea uliyoathirika kwa uchambuzi wa AI"
            : "Take a photo of the affected plant for AI analysis"}
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
                {isSw ? "Piga Picha" : "Take Photo"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {isSw ? "Au chagua kutoka galeria" : "Or choose from gallery"}
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
                    {isSw ? "Inachambua..." : "Analyzing..."}
                  </span>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="space-y-3">
              <Card variant="forest">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                      {isSw ? "Ugonjwa / Tatizo" : "Issue Detected"}
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold">{result.issue}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {isSw ? "Uhakika" : "Confidence"}: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </Card>

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
            </div>
          )}

          <button
            onClick={() => {
              setPreview(null);
              setResult(null);
            }}
            className="w-full rounded-xl border border-card-border py-3 text-sm font-medium text-soil transition-colors hover:bg-cream-dark"
          >
            {isSw ? "Piga Picha Nyingine" : "Take Another Photo"}
          </button>
        </div>
      )}
    </div>
  );
}
