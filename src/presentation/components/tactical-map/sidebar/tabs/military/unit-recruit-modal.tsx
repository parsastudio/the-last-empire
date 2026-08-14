"use client";

import React from "react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { UnitConfig } from "@/presentation/components/tactical-map/sidebar/tabs/military/unit-recruitment-card";
import { UnitRecruitForm } from "@/presentation/components/tactical-map/sidebar/tabs/military/components/unit-recruit-form";

interface UnitRecruitModalProps {
  isOpen: boolean;
  unit: UnitConfig | null;
  treasury: number;
  techLevel?: number;
  industrialLevel?: number;
  onClose: () => void;
  onConfirm: (unit: UnitConfig, quantity: number) => Promise<void> | void;
}

export function UnitRecruitModal({
  isOpen,
  unit,
  treasury,
  techLevel = 1,
  industrialLevel = 1,
  onClose,
  onConfirm,
}: UnitRecruitModalProps) {
  if (!isOpen || !unit) return null;

  return (
    <UnifiedModalShell
      isOpen={true}
      title={`سفارش ساخت ${unit.name}`}
      subtitle={unit.desc}
      maxWidthClass="max-w-md"
      onClose={onClose}
    >
      <UnitRecruitForm
        key={unit.type}
        unit={unit}
        treasury={treasury}
        techLevel={techLevel}
        industrialLevel={industrialLevel}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </UnifiedModalShell>
  );
}
