import React from "react";

interface SelectionModalProps {
  countryName: string;
  countryCode: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SelectionModal({
  countryName,
  countryCode,
  onConfirm,
  onCancel,
}: SelectionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-950/95 border border-slate-900 rounded-[32px] p-8 max-w-sm w-full space-y-5 shadow-2xl font-mono">
        <div className="space-y-1.5">
          <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">
            Mandate of Sovereignty
          </span>
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">
            Accept Governance Invitation?
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed pt-1.5">
            Are you prepared to claim supreme executive authority and govern{" "}
            {countryName} ({countryCode})?
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-slate-900/40 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl text-[10px] font-bold transition-all"
          >
            Decline
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-bold transition-all border border-emerald-500/20 shadow-lg shadow-emerald-950/20"
          >
            Accept Mandate
          </button>
        </div>
      </div>
    </div>
  );
}
