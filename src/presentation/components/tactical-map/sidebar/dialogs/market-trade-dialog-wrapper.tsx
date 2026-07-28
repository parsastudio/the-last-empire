import React from "react";
import { TradeActionDialog } from "../tabs/market/trade-action-dialog";
import { TradeDialogState } from "../hooks/use-sidebar-turn-actions";

interface MarketTradeDialogWrapperProps {
  state: TradeDialogState;
  onClose: () => void;
  onConfirm: () => void;
}

export function MarketTradeDialogWrapper({
  state,
  onClose,
  onConfirm,
}: MarketTradeDialogWrapperProps) {
  return (
    <TradeActionDialog
      isOpen={state.isOpen}
      resourceName={state.resourceName}
      unit={state.unit}
      mode={state.mode}
      unitPrice={state.unitPrice}
      maxAmount={state.maxAmount}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
