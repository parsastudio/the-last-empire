import React from "react";
import { useTranslations } from "next-intl";
import { FolderX, Home, PlusCircle } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";

interface CampaignNotFoundModalProps {
  isOpen: boolean;
  gameId: string;
}

export function CampaignNotFoundModal({
  isOpen,
  gameId,
}: CampaignNotFoundModalProps) {
  const t = useTranslations("hud.notFound");
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={t("title")}
      subtitle={t("subtitle", { id: gameId })}
      maxWidthClass="max-w-md"
      onClose={() => router.push("/")}
    >
      <div className="space-y-5 text-start font-sans">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-military/15 border border-military/30 text-military flex items-center justify-center shadow-lg">
            <FolderX size={28} />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("desc", { id: gameId })}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => router.push("/select-nation")}
            className="w-full py-3.5 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gdp/10"
          >
            <PlusCircle size={15} />
            <span>{t("startNew")}</span>
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full py-3.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-2xl font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={15} />
            <span>{t("backToMenu")}</span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
