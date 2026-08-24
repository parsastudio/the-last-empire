export interface QuadtreeLeafNode {
  isLeaf: true;
  provinceId: number;
}

export interface QuadtreeBranchNode {
  isLeaf: false;
  children: [QuadtreeNode, QuadtreeNode, QuadtreeNode, QuadtreeNode];
}

export type QuadtreeNode = QuadtreeLeafNode | QuadtreeBranchNode;

export interface QuadtreeBuildStats {
  originalSizeBytes: number;
  quadtreeSizeBytes: number;
  compressionRatioPercent: number;
  totalNodesCount: number;
  leafNodesCount: number;
  branchNodesCount: number;
  maxDepth: number;
}
