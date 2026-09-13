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
