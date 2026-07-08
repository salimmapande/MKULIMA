"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sprout } from "lucide-react";
import { getProfile } from "@/lib/storage";
import { calendarTasks, cropLabels } from "@/lib/crops";
import type { CalendarTask, CropType, FarmerProfile } from "@/lib/types";
import { Card } from "./card";
import { cn } from "@/lib/utils";

const monthNames = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  sw: ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"],
};

const priorityColors = {
  high: "bg-terracotta/15 text-terracotta-dark border-terracotta/30",
  medium: "bg-wheat/20 text-soil border-wheat/40",
  low: "bg-sage-light/50 text-moss border-sage/30",
};

export function CropCalendar() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const isSw = profile?.language === "sw";
  const months = isSw ? monthNames.sw : monthNames.en;
  const crops = profile?.crops ?? [];

  const tasks = calendarTasks.filter(
    (t) => (t.crop === "all" || crops.length === 0 || crops.includes(t.crop)) && t.month === month
  );

  function prevMonth() {
    setMonth((m) => (m === 1 ? 12 : m - 1));
  }

  function nextMonth() {
    setMonth((m) => (m === 12 ? 1 : m + 1));
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-forest">
          {isSw ? "Kalenda ya Mazao" : "Crop Calendar"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isSw ? "Shughuli za msimu kwa mazao yako" : "Seasonal tasks for your crops"}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-2xl bg-forest px-4 py-3 text-white">
        <button onClick={prevMonth} className="rounded-lg p-1 hover:bg-white/10">
          <ChevronLeft size={20} />
        </button>
        <span className="font-display text-lg font-semibold">{months[month - 1]}</span>
        <button onClick={nextMonth} className="rounded-lg p-1 hover:bg-white/10">
          <ChevronRight size={20} />
        </button>
      </div>

      {crops.length === 0 && (
        <Card className="mb-4 border-wheat/40 bg-wheat/10">
          <p className="text-sm text-soil-light">
            {isSw
              ? "Ongeza mazao yako kwenye wasifu ili kuona shughuli zinazofaa."
              : "Add your crops in Profile to see personalized tasks."}
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card className="text-center">
            <Sprout className="mx-auto h-8 w-8 text-sage" />
            <p className="mt-2 text-sm text-muted">
              {isSw ? "Hakuna shughuli maalum mwezi huu." : "No specific tasks this month."}
            </p>
          </Card>
        ) : (
          tasks.map((task, i) => (
            <TaskCard key={task.id} task={task} isSw={isSw} delay={i} />
          ))
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  isSw,
  delay,
}: {
  task: CalendarTask;
  isSw: boolean;
  delay: number;
}) {
  const cropLabel =
    task.crop === "all"
      ? isSw ? "Mazao yote" : "All crops"
      : cropLabels[task.crop as CropType]?.[isSw ? "sw" : "en"] ?? task.crop;

  return (
    <Card
      className={cn("animate-fade-up opacity-0", `stagger-${Math.min(delay + 1, 4)}`)}
      style={{ animationDelay: `${delay * 0.05}s`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-forest">
              {cropLabel}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                priorityColors[task.priority]
              )}
            >
              {task.priority}
            </span>
          </div>
          <h3 className="mt-2 font-display font-semibold text-soil">
            {isSw ? task.titleSw : task.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {isSw ? task.descriptionSw : task.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
