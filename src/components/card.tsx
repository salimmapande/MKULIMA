import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "forest" | "terracotta" | "sage";
  onClick?: () => void;
  style?: CSSProperties;
}

const variants = {
  default: "bg-card border-card-border text-soil",
  forest: "bg-forest text-white border-forest-dark",
  terracotta: "bg-terracotta text-white border-terracotta-dark",
  sage: "bg-sage-light/50 text-forest-dark border-sage",
};

export function Card({ children, className, variant = "default", onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        "rounded-2xl border p-4 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md active:scale-[0.98]",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
