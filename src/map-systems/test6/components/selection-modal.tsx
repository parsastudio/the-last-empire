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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-100">
            governance invitation
          </h3>
          <p className="text-xs text-slate-400">
            Are you prepared to declare yourself the supreme leader of{" "}
            {countryName} ({countryCode})?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Accept Mandate
          </button>
        </div>
      </div>
    </div>
  );
}
