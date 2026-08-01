import {
  COMPREHENSIVE_RESEARCH_TREE,
  ResearchNode,
} from "@/domain/politics/research-tree.config";

export interface Doctrine {
  id: string;
  name: string;
  branch: "INDUSTRIAL_TECH" | "ASYMMETRIC_MILITARY" | "DIPLOMATIC_HEGEMONY";
  cost: number;
}

export const DEFAULT_DOCTRINES: Doctrine[] = COMPREHENSIVE_RESEARCH_TREE.map(
  (node) => ({
    id: node.id,
    name: node.nameFa,
    branch: node.branch,
    cost: node.cost,
  }),
);

export { COMPREHENSIVE_RESEARCH_TREE };
export type { ResearchNode };
