"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";
import { getProfile } from "@/lib/storage";
import { getWeatherTips } from "@/lib/ai";
import { Card } from "./card";

const icons = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  wind: Wind,
};

export function WeatherWidget() {
  const [tip, setTip] = useState<{ condition: string; tip: string; icon: keyof typeof icons } | null>(null);

  useEffect(() => {
    const profile = getProfile();
    setTip(getWeatherTips(profile.language === "sw"));
  }, []);

  if (!tip) return null;

  const Icon = icons[tip.icon];

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sage-light/40" />
      <div className="relative flex items-start gap-3">
        <div className="rounded-xl bg-forest/10 p-2.5">
          <Icon className="h-5 w-5 text-forest" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest">
            {tip.condition}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-soil-light">{tip.tip}</p>
        </div>
      </div>
    </Card>
  );
}
