import React from "react";
import { Search, Compass, Zap, X } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { SidebarTabType } from "../sidebar/sidebar-tabs";
import { useCommandPaletteSearch } from "./hooks/use-command-palette-search";
import { NavigationNode } from "./types/navigation-params.schema";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (tab: SidebarTabType, subTab?: string) => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectNode,
}: CommandPaletteModalProps) {
  const { query, setQuery, filteredNodes } = useCommandPaletteSearch();

  if (!isOpen) return null;

  const handleSelect = (node: NavigationNode) => {
    onSelectNode(node.tab, node.subTab);
    onClose();
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="جستجوی سریع در اتاق فرماندهی"
      subtitle="دسترسی آنی به بخش‌های مختلف با سیستم ناوبری هوشمند"
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 dir-rtl text-right">
        <div className="relative">
          <Search
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            autoFocus
            placeholder="جستجوی بخش (مثلاً: خرید نفت، مالیات، ارتش)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-2xl py-3 pr-10 pl-4 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors text-right"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredNodes.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground italic bg-secondary/20 rounded-2xl border border-border/40 p-4">
              هیچ بخشی با این عبارت یافت نشد.
            </div>
          ) : (
            filteredNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => handleSelect(node)}
                className="w-full bg-background/50 hover:bg-secondary/60 border border-border/70 hover:border-primary/40 p-3.5 rounded-2xl text-right transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                    <Compass size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {node.title}
                      </span>
                      <span className="text-[9px] font-mono bg-secondary/80 px-2 py-0.5 rounded text-muted-foreground">
                        {node.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {node.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-gdp shrink-0">
                  <Zap size={12} />
                  <span>انتقال به بخش</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </UnifiedModalShell>
  );
}
