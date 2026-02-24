"use client";

import { ReactNode, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronDown, ChevronRight } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  accent?: "blue" | "green" | "red";
  collapsible?: boolean;
  defaultOpen?: boolean;
  scrollable?: boolean;
}

export default function GlassPanel({
  children,
  className,
  title,
  accent = "blue",
  collapsible = false,
  defaultOpen = true,
  scrollable = true
}: GlassPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const accentColors = {
    blue: {
      corner: "border-holographic-blue/50",
      dot: "bg-holographic-blue",
      titleText: "text-slate-200",
      glow: "shadow-[0_0_1px_rgba(0,176,255,0.2)]",
    },
    green: {
      corner: "border-neon-green/50",
      dot: "bg-neon-green",
      titleText: "text-neon-green",
      glow: "shadow-[0_0_1px_rgba(0,230,118,0.2)]",
    },
    red: {
      corner: "border-alert-red/50",
      dot: "bg-alert-red",
      titleText: "text-alert-red",
      glow: "shadow-[0_0_1px_rgba(255,61,0,0.2)]",
    },
  };

  const a = accentColors[accent];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/78 backdrop-blur-sm glass-panel-glow hud-corners hud-corners-bottom flex flex-col transition-all duration-300",
        a.glow,
        className,
        collapsible && !isOpen && "grow-0 shrink-0 h-auto flex-none min-h-0"
      )}
    >
      {title && (
        <div
          className={cn(
            "panel-title-bar border-b border-slate-700/70 px-4 py-2 flex items-center justify-between bg-slate-900/70 shrink-0 select-none",
            collapsible && "cursor-pointer hover:bg-slate-800/70 transition-colors"
          )}
          onClick={() => collapsible && setIsOpen(!isOpen)}
        >
          <h3 className={cn("font-mono text-xs uppercase tracking-[0.14em] flex items-center gap-2", a.titleText)}>
            <span className={cn("w-1.5 h-1.5 rounded-full status-dot", a.dot)} />
            {title}
          </h3>
          <div className="flex gap-1.5 items-center">
            {collapsible ? (
              isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
            ) : (
              <>
                <div className="w-1 h-1 bg-neon-green/60 rounded-full" />
                <div className="w-1 h-1 bg-holographic-blue/60 rounded-full" />
                <div className="w-1 h-1 bg-slate-600 rounded-full" />
              </>
            )}
          </div>
        </div>
      )}
      {isOpen && (
        <div className={cn(
          "p-4 relative z-10 flex-1 min-h-0",
          scrollable && "overflow-y-auto"
        )}>
          {children}
        </div>
      )}
    </div>
  );
}
