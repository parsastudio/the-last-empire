import React from "react";
import {
  ProcurementUnitCard,
  ProcurementUnitItemInfo,
} from "./procurement-unit-card";
import { FloatingFeedback } from "@/presentation/hooks/game/use-floating-feedback";

export type QuickUnitBatchInfo = ProcurementUnitItemInfo;

interface QuickUnitRecruitCardProps {
  info: QuickUnitBatchInfo;
  feedbacks?: FloatingFeedback[];
  onBuy: (info: QuickUnitBatchInfo) => void;
}

export function QuickUnitRecruitCard({
  info,
  feedbacks,
  onBuy,
}: QuickUnitRecruitCardProps) {
  return (
    <ProcurementUnitCard
      info={info}
      variant="domestic"
      feedbacks={feedbacks}
      onBuy={onBuy}
    />
  );
}
