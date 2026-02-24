import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "neon" | "alert";
}

export function GlassCard({
  children,
  className,
  variant = "default",
  ...props
}: GlassCardProps) {
  const variants = {
    default: "border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
    neon: "border-neon-green/30 shadow-[0_0_15px_rgba(0,230,118,0.2)]",
    alert: "border-alert-red/30 shadow-[0_0_15px_rgba(255,61,0,0.2)]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-dark-bg/40 backdrop-blur-md",
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Glossy overlay effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />

      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>
    </div>
  );
}
