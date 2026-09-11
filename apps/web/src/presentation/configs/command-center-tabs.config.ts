import {
  LayoutDashboard,
  Swords,
  Factory,
  Rocket,
  Landmark,
  FileText,
  Users,
  Binary,
  LucideIcon,
} from "lucide-react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";

export interface CommandCenterTabConfig {
  id: SidebarTabType;
  icon: LucideIcon;
}

export const COMMAND_CENTER_TABS_CONFIG: Record<
  SidebarTabType,
  CommandCenterTabConfig
> = {
  overview: {
    id: "overview",
    icon: LayoutDashboard,
  },
  military: {
    id: "military",
    icon: Swords,
  },
  industry: {
    id: "industry",
    icon: Factory,
  },
  projects: {
    id: "projects",
    icon: Rocket,
  },
  politics: {
    id: "politics",
    icon: Landmark,
  },
  espionage: {
    id: "espionage",
    icon: Binary,
  },
  reports: {
    id: "reports",
    icon: FileText,
  },
  diplomacy: {
    id: "diplomacy",
    icon: Users,
  },
};

export const COMMAND_RAIL_TABS: {
  id: SidebarTabType;
  icon: LucideIcon;
}[] = [
  { id: "overview", icon: LayoutDashboard },
  { id: "military", icon: Swords },
  { id: "industry", icon: Factory },
  { id: "projects", icon: Rocket },
  { id: "politics", icon: Landmark },
  { id: "espionage", icon: Binary },
  { id: "reports", icon: FileText },
  { id: "diplomacy", icon: Users },
];
