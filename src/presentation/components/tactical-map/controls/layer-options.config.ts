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
    label: "نقشه سیاسی",
    icon: Eye,
    color: "text-gdp",
  },
  {
    id: "gdp",
    label: "پایش اقتصاد GDP",
    icon: Coins,
    color: "text-treasury",
  },
  {
    id: "military",
    label: "پایش جغرافیای نظامی",
    icon: Swords,
    color: "text-military",
  },
];
