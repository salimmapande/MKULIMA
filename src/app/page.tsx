"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Camera,
  Calendar,
  Sprout,
  ArrowRight,
  Leaf,
  LandPlot,
  Bell,
} from "lucide-react";
import { getProfile } from "@/lib/storage";
import { cropLabels, getUpcomingTasks } from "@/lib/crops";
import type { FarmerProfile } from "@/lib/types";
import { Card } from "@/components/card";
import { WeatherWidget } from "@/components/weather-widget";

const quickActions = [
  {
    href: "/advisor",
    icon: MessageCircle,
    titleEn: "Ask AI Advisor",
    titleSw: "Uliza Mshauri AI",
    descEn: "Crop care, pests, fertilizer",
    descSw: "Utunzaji, wadudu, mbolea",
    color: "bg-forest",
  },
  {
    href: "/diagnose",
    icon: Camera,
    titleEn: "Gundua Mmea",
    titleSw: "Gundua Mmea",
    descEn: "AI crop health, pest & bacteria detection",
    descSw: "Afya ya mmea, wadudu na bakteria kwa AI",
    color: "bg-terracotta",
  },
  {
    href: "/ardhi",
    icon: LandPlot,
    titleEn: "Gundua Ardhi",
    titleSw: "Gundua Ardhi",
    descEn: "Soil fertility, fertilizer & crop analysis",
    descSw: "Rutuba, mbolea na uchambuzi wa udongo",
    color: "bg-soil-light",
  },
  {
    href: "/alerts",
    icon: Bell,
    titleEn: "SMS Alerts",
    titleSw: "Arifa za SMS",
    descEn: "Watering alerts & buy SMS via M-Pesa",
    descSw: "Arifa za kumwagilia na nunua SMS",
    color: "bg-moss",
  },
  {
    href: "/calendar",
    icon: Calendar,
    titleEn: "Crop Calendar",
    titleSw: "Kalenda ya Mazao",
    descEn: "Seasonal farming tasks",
    descSw: "Shughuli za msimu",
    color: "bg-sage",
  },
];

export default function HomePage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const isSw = profile?.language === "sw";
  const upcoming = profile ? getUpcomingTasks(profile.crops).slice(0, 3) : [];

  return (
    <div>
      {/* Hero header */}
      <div className="relative overflow-hidden bg-forest px-4 pb-8 pt-10 text-white">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-sage-light" />
            <span className="text-xs font-semibold uppercase tracking-widest text-sage-light">
              Mkulima
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold">
            {isSw
              ? profile?.name
                ? `Habari, ${profile.name}`
                : "Karibu, Mkulima"
              : profile?.name
                ? `Hello, ${profile.name}`
                : "Welcome, Farmer"}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {isSw
              ? "Msaidizi wako wa kilimo kwa AI"
              : "Your AI-powered farming companion"}
          </p>
        </div>
      </div>

      <div className="-mt-4 space-y-4 px-4">
        <WeatherWidget />

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action, i) => (
            <Link key={action.href} href={action.href}>
              <Card
                className={`animate-fade-up opacity-0 stagger-${i + 1} flex items-center gap-4 !p-3.5`}
                style={{ animationFillMode: "forwards" }}
              >
                <div className={`rounded-xl ${action.color} p-3 text-white shadow-md`}>
                  <action.icon size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-soil">
                    {isSw ? action.titleSw : action.titleEn}
                  </p>
                  <p className="text-xs text-muted">
                    {isSw ? action.descSw : action.descEn}
                  </p>
                </div>
                <ArrowRight size={18} className="text-sage" />
              </Card>
            </Link>
          ))}
        </div>

        {/* Upcoming tasks */}
        {upcoming.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-forest">
                {isSw ? "Shughuli Zijazo" : "Upcoming Tasks"}
              </h2>
              <Link href="/calendar" className="text-xs font-medium text-terracotta">
                {isSw ? "Ona zote" : "See all"} →
              </Link>
            </div>
            <div className="space-y-2">
              {upcoming.map((task) => (
                <Card key={task.id} className="!p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-wheat/20 p-2">
                      <Sprout className="h-4 w-4 text-forest" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-soil">
                        {isSw ? task.titleSw : task.title}
                      </p>
                      <p className="text-xs text-muted">
                        {task.crop !== "all"
                          ? cropLabels[task.crop][isSw ? "sw" : "en"]
                          : ""}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Profile prompt */}
        {!profile?.name && (
          <Card variant="sage" className="text-center">
            <p className="text-sm font-medium text-forest">
              {isSw
                ? "Kamilisha wasifu wako kwa ushauri bora zaidi"
                : "Complete your profile for better advice"}
            </p>
            <Link
              href="/profile"
              className="mt-3 inline-block rounded-xl bg-forest px-5 py-2 text-sm font-semibold text-white"
            >
              {isSw ? "Weka Wasifu" : "Set Up Profile"}
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
