import React from "react";
import {
  ProcurementUnitCard,
  ProcurementUnitItemInfo,
} from "@/presentation/components/tactical-map/sidebar/tabs/military/components/procurement-unit-card";
import { FloatingFeedback } from "@/presentation/hooks/game/use-floating-feedback";

export type AlliedUnitProcurementInfo = ProcurementUnitItemInfo;

interface AlliedUnitBuyCardProps {
  info: AlliedUnitProcurementInfo;
  feedbacks?: FloatingFeedback[];
  onBuy: (info: AlliedUnitProcurementInfo) => void;
}

export function AlliedUnitBuyCard({
  info,
  feedbacks,
  onBuy,
}: AlliedUnitBuyCardProps) {
  return (
    <ProcurementUnitCard
      info={info}
      variant="allied"
      feedbacks={feedbacks}
      onBuy={onBuy}
    />
  );
}
