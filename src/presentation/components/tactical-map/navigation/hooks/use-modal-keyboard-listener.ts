import { useEffect } from "react";

interface UseModalKeyboardListenerProps {
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export function useModalKeyboardListener({
  onOpenCommandPalette,
  onOpenSettings,
  onOpenGuide,
}: UseModalKeyboardListenerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenCommandPalette();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "comma") {
        e.preventDefault();
        onOpenSettings();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        onOpenGuide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenCommandPalette, onOpenSettings, onOpenGuide]);
}
