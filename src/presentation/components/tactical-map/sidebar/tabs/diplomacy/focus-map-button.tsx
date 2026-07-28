import React from "react";
import { MapPin } from "lucide-react";

interface FocusMapButtonProps {
  countryCode: string;
  countryName: string;
  onFocus: (countryCode: string) => void;
}

export function FocusMapButton({
  countryCode,
  countryName,
  onFocus,
}: FocusMapButtonProps) {
  return (
    <button
      onClick={() => onFocus(countryCode)}
      className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
    >
      <MapPin size={14} className="text-military" />
      <span>تمرکز دوربین روی {countryName}</span>
    </button>
  );
}
