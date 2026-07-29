import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { ToastType } from "@/presentation/context/toast-context";

export function useToastItemStyle(type: ToastType) {
  return useMemo(() => {
    switch (type) {
      case "success":
        return {
          border: "border-gdp/40",
          bg: "bg-card/90",
          iconBg: "bg-gdp/15 text-gdp",
          icon: CheckCircle2,
        };
      case "error":
        return {
          border: "border-military/40",
          bg: "bg-card/90",
          iconBg: "bg-military/15 text-military",
          icon: XCircle,
        };
      case "warning":
        return {
          border: "border-treasury/40",
          bg: "bg-card/90",
          iconBg: "bg-treasury/15 text-treasury",
          icon: AlertTriangle,
        };
      default:
        return {
          border: "border-primary/40",
          bg: "bg-card/90",
          iconBg: "bg-primary/15 text-primary",
          icon: Info,
        };
    }
  }, [type]);
}
