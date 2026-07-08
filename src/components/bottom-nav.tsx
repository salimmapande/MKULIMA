"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Camera, Calendar, User, LandPlot } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home", labelSw: "Nyumbani" },
  { href: "/advisor", icon: MessageCircle, label: "Advisor", labelSw: "Mshauri" },
  { href: "/diagnose", icon: Camera, label: "Mmea", labelSw: "Mmea" },
  { href: "/ardhi", icon: LandPlot, label: "Ardhi", labelSw: "Ardhi" },
  { href: "/calendar", icon: Calendar, label: "Calendar", labelSw: "Kalenda" },
  { href: "/profile", icon: User, label: "Profile", labelSw: "Wasifu" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 border-t border-card-border bg-white/90 backdrop-blur-md">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all duration-200",
                active
                  ? "text-forest"
                  : "text-muted hover:text-soil-light"
              )}
            >
              <div
                className={cn(
                  "rounded-xl p-1.5 transition-all duration-200",
                  active && "bg-forest text-white shadow-md shadow-forest/20"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={cn("text-[9px] font-medium", active && "font-semibold")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
