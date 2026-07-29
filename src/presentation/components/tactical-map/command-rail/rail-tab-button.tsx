import React from "react";
import { LucideIcon } from "lucide-react";
import { SidebarTabType } from "../sidebar/sidebar-tabs";

interface RailTabButtonProps {
  id: SidebarTabType;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: (id: SidebarTabType) => void;
}

export function RailTabButton({
  id,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  onClick,
}: RailTabButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`relative group flex items-center rounded-2xl transition-all cursor-pointer ${
        isCollapsed ? "justify-center p-2.5 w-full" : "gap-3 p-3 w-full"
      } ${
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      }`}
      title={isCollapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!isCollapsed && (
        <span className="text-xs font-sans whitespace-nowrap truncate">
          {label}
        </span>
      )}

      {isCollapsed && (
        <span className="absolute right-full mr-3 px-2.5 py-1 bg-card border border-border text-foreground text-[10px] rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  );
}
