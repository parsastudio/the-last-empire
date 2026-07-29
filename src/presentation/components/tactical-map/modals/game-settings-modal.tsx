import React, { useState } from "react";
import { Volume2, Monitor, Bell, Check } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameSettingsModal({ isOpen, onClose }: GameSettingsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="تنظیمات سیستم و رابط کاربری"
      subtitle="تنظیمات گرافیک، صدا و ذخیره‌سازی کمپین"
      maxWidthClass="max-w-md"
      onClose={onClose}
    >
      <div className="space-y-4 dir-rtl text-right font-sans">
        <div className="bg-background/40 border border-border/80 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-primary" />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  جلوه‌های صوتی و هشدارها
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  پخش صدای اعلان‌ها و بحران‌های ملی
                </span>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? "bg-primary" : "bg-secondary"
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  soundEnabled ? "right-1" : "right-5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Monitor size={16} className="text-gdp" />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  انیمیشن‌های نقشه تاکتیکی
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  جلوه‌های بصری نرم و ترانزیشن‌ها
                </span>
              </div>
            </div>
            <button
              onClick={() => setAnimationsEnabled((prev) => !prev)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                animationsEnabled ? "bg-primary" : "bg-secondary"
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  animationsEnabled ? "right-1" : "right-5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-treasury" />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  ذخیره‌سازی خودکار (Auto-Save)
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  ذخیره اطلاعات در دیتابیس محلی مرورگر در پایان نوبت
                </span>
              </div>
            </div>
            <button
              onClick={() => setAutoSaveEnabled((prev) => !prev)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoSaveEnabled ? "bg-primary" : "bg-secondary"
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  autoSaveEnabled ? "right-1" : "right-5"
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Check size={16} />
          <span>ذخیره و اعمال تنظیمات</span>
        </button>
      </div>
    </UnifiedModalShell>
  );
}
