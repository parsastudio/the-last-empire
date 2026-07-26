import React from "react";
import { Download, Upload } from "lucide-react";

interface EditorCardProps {
  isImporting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EditorCard({
  isImporting,
  fileInputRef,
  onExport,
  onImport,
}: EditorCardProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-5">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
          Manual Map Editor
        </span>
        <h2 className="text-base font-bold text-slate-100 tracking-tight">
          Export & Re-import 4K Flat Canvas
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed pt-1.5">
          Download a pixel-perfect, flat, warm-colored map image, perform edits
          in Photoshop or GIMP (add/remove islands, close seas), and import it
          back seamlessly.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={onExport}
          className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl font-bold transition-all text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download size={14} />
          Export Flat Map
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all border border-amber-500/20 shadow-lg shadow-amber-950/20 text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer"
        >
          <Upload size={14} className={isImporting ? "animate-pulse" : ""} />
          {isImporting ? "Importing..." : "Import Edited Map"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png"
          onChange={onImport}
          className="hidden"
        />
      </div>
    </div>
  );
}
