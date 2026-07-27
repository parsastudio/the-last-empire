import { Eye, Coins, Swords } from "lucide-react";
import { TacticalLayer } from "./layer-controller";

export interface LayerOption {
  id: TacticalLayer;
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
}

export const LAYER_OPTIONS: LayerOption[] = [
  {
    id: "political",
    label: "نمای سیاسی",
    icon: Eye,
    color: "text-emerald-400",
  },
  {
    id: "gdp",
    label: "پایش لوجستیک (GDP)",
    icon: Coins,
    color: "text-amber-400",
  },
  {
    id: "military",
    label: "خطوط مقدم نبرد",
    icon: Swords,
    color: "text-rose-400",
  },
];
