"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check } from "lucide-react";
import { getProfile, saveProfile, defaultProfile } from "@/lib/storage";
import { cropLabels, tanzanianRegions } from "@/lib/crops";
import { SITE_CONFIG } from "@/lib/site";
import type { CropType, FarmerProfile } from "@/lib/types";
import { Card } from "./card";
import { cn } from "@/lib/utils";

const allCrops = Object.keys(cropLabels) as CropType[];

export function ProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<FarmerProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  function update(field: keyof FarmerProfile, value: string | CropType[] | "sw" | "en") {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaved(false);
  }

  function toggleCrop(crop: CropType) {
    setProfile((p) => ({
      ...p,
      crops: p.crops.includes(crop)
        ? p.crops.filter((c) => c !== crop)
        : [...p.crops, crop],
    }));
    setSaved(false);
  }

  function handleSave() {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => router.push("/"), 800);
  }

  const isSw = profile.language === "sw";

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-forest">
          {isSw ? "Wasifu Wako" : "Your Profile"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isSw
            ? "Taarifa hizi zinasaidia AI kutoa ushauri sahihi"
            : "This helps AI give you personalized advice"}
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <label className="text-xs font-semibold uppercase tracking-wide text-forest">
            {isSw ? "Lugha / Language" : "Language / Lugha"}
          </label>
          <div className="mt-2 flex gap-2">
            {(["sw", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => update("language", lang)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
                  profile.language === lang
                    ? "bg-forest text-white shadow-md"
                    : "bg-cream-dark text-soil-light hover:bg-sage-light/50"
                )}
              >
                {lang === "sw" ? "Kiswahili" : "English"}
              </button>
            ))}
          </div>
        </Card>

        <Field
          label={isSw ? "Jina lako" : "Your name"}
          value={profile.name}
          onChange={(v) => update("name", v)}
          placeholder={isSw ? "Mfano: Juma Hassan" : "e.g. Juma Hassan"}
        />

        <Field
          label={isSw ? "Wilaya / Kijiji" : "District / Village"}
          value={profile.location}
          onChange={(v) => update("location", v)}
          placeholder={isSw ? "Mfano: Mvomero, Morogoro" : "e.g. Mvomero, Morogoro"}
        />

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-forest">
            {isSw ? "Mkoa" : "Region"}
          </label>
          <select
            value={profile.region}
            onChange={(e) => update("region", e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-card-border bg-cream px-4 py-2.5 text-sm text-soil focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
          >
            <option value="">{isSw ? "Chagua mkoa" : "Select region"}</option>
            {tanzanianRegions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <Field
          label={isSw ? "Ukubwa wa shamba" : "Farm size"}
          value={profile.farmSize}
          onChange={(v) => update("farmSize", v)}
          placeholder={isSw ? "Mfano: ekari 2" : "e.g. 2 acres"}
        />

        <Field
          label={isSw ? "Simu (kwa arifa za SMS)" : "Phone (for SMS alerts)"}
          value={profile.phone}
          onChange={(v) => update("phone", v)}
          placeholder={`${SITE_CONFIG.phonePrefix}7...`}
          type="tel"
        />

        <Card>
          <label className="text-xs font-semibold uppercase tracking-wide text-forest">
            {isSw ? "Mazao unayolima" : "Crops you grow"}
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {allCrops.map((crop) => {
              const selected = profile.crops.includes(crop);
              const label = cropLabels[crop][isSw ? "sw" : "en"];
              return (
                <button
                  key={crop}
                  onClick={() => toggleCrop(crop)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    selected
                      ? "border-forest bg-forest text-white"
                      : "border-card-border bg-cream text-soil-light hover:border-sage"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Card>

        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta py-3.5 font-semibold text-white shadow-lg shadow-terracotta/25 transition-all hover:bg-terracotta-dark active:scale-[0.98]"
        >
          {saved ? (
            <>
              <Check size={18} />
              {isSw ? "Imehifadhiwa!" : "Saved!"}
            </>
          ) : (
            <>
              <Save size={18} />
              {isSw ? "Hifadhi Wasifu" : "Save Profile"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-forest">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-card-border bg-cream px-4 py-2.5 text-sm text-soil placeholder:text-muted focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
      />
    </div>
  );
}
