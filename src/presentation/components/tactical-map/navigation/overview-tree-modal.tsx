import React from "react";
import { Compass, ArrowLeft } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { SidebarTabType } from "../sidebar/sidebar-tabs";
import { NAVIGATION_TREE_NODES } from "./config/navigation-tree.config";
import { NavigationNode } from "./types/navigation-params.schema";

interface OverviewTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (tab: SidebarTabType, subTab?: string) => void;
}

export function OverviewTreeModal({
  isOpen,
  onClose,
  onSelectNode,
}: OverviewTreeModalProps) {
  if (!isOpen) return null;

  const categories = Array.from(
    new Set(NAVIGATION_TREE_NODES.map((n) => n.category)),
  );

  const handleSelect = (node: NavigationNode) => {
    onSelectNode(node.tab, node.subTab);
    onClose();
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="نقشه جامع ساختار درختی منوها"
      subtitle="نمای کلی و کامل تمام بخش‌ها و قابلیت‌های اتاق فرماندهی"
      maxWidthClass="max-w-4xl"
      onClose={onClose}
    >
      <div className="space-y-6 dir-rtl text-right">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const categoryNodes = NAVIGATION_TREE_NODES.filter(
              (n) => n.category === category,
            );
            return (
              <div
                key={category}
                className="bg-background/40 border border-border/80 p-4 rounded-2xl space-y-3"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Compass size={16} className="text-primary" />
                  <h4 className="text-xs font-bold text-foreground">
                    {category}
                  </h4>
                </div>

                <div className="space-y-1.5">
                  {categoryNodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => handleSelect(node)}
                      className="w-full bg-secondary/40 hover:bg-secondary border border-border/40 p-2.5 rounded-xl text-right transition-all flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {node.title}
                      </span>
                      <ArrowLeft
                        size={12}
                        className="text-muted-foreground group-hover:-translate-x-1 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </UnifiedModalShell>
  );
}
