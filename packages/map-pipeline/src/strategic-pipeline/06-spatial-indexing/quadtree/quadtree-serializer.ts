import {
  QuadtreeNode,
  QuadtreeBuildStats,
  QuadtreeBranchNode,
} from "@/infrastructure/strategic-pipeline/06-spatial-indexing/quadtree/quadtree-types";

interface QueueItem {
  node: QuadtreeBranchNode;
  targetIndex: number;
}

export class QuadtreeSerializer {
  private static readonly MAGIC_NUMBER = 0x51545245;
  private static readonly FORMAT_VERSION = 1;
  private static readonly LEAF_BIT_FLAG = 0x80000000;
  private static readonly HEADER_BYTE_SIZE = 24;

  public static serializeDualRoot(
    rootWest: QuadtreeNode,
    rootEast: QuadtreeNode,
    mapWidth: number,
    mapHeight: number,
  ): { buffer: Uint8Array; stats: QuadtreeBuildStats } {
    const flatNodes: number[] = [0, 0];
    const queue: QueueItem[] = [];

    let leafCount = 0;
    let branchCount = 0;

    const rootWestIdx = 0;
    const rootEastIdx = 1;

    if (rootWest.isLeaf) {
      flatNodes[rootWestIdx] =
        this.LEAF_BIT_FLAG | (rootWest.provinceId & 0xffff);
      leafCount++;
    } else {
      branchCount++;
      queue.push({ node: rootWest, targetIndex: rootWestIdx });
    }

    if (rootEast.isLeaf) {
      flatNodes[rootEastIdx] =
        this.LEAF_BIT_FLAG | (rootEast.provinceId & 0xffff);
      leafCount++;
    } else {
      branchCount++;
      queue.push({ node: rootEast, targetIndex: rootEastIdx });
    }

    let head = 0;
    while (head < queue.length) {
      const item = queue[head++]!;
      const childBaseIndex = flatNodes.length;
      flatNodes[item.targetIndex] = childBaseIndex & 0x7fffffff;

      flatNodes.push(0, 0, 0, 0);

      for (let i = 0; i < 4; i++) {
        const childNode = item.node.children[i]!;
        const slotIndex = childBaseIndex + i;

        if (childNode.isLeaf) {
          flatNodes[slotIndex] =
            this.LEAF_BIT_FLAG | (childNode.provinceId & 0xffff);
          leafCount++;
        } else {
          flatNodes[slotIndex] = 0;
          branchCount++;
          queue.push({ node: childNode, targetIndex: slotIndex });
        }
      }
    }

    const totalNodes = flatNodes.length;
    const nodesByteSize = totalNodes * 4;
    const totalBytes = this.HEADER_BYTE_SIZE + nodesByteSize;

    const outputBuffer = new Uint8Array(totalBytes);
    const dataView = new DataView(outputBuffer.buffer);

    dataView.setUint32(0, this.MAGIC_NUMBER, true);
    dataView.setUint16(4, this.FORMAT_VERSION, true);
    dataView.setUint16(6, mapWidth, true);
    dataView.setUint16(8, mapHeight, true);
    dataView.setUint16(10, 0, true);
    dataView.setUint32(12, rootWestIdx, true);
    dataView.setUint32(16, rootEastIdx, true);
    dataView.setUint32(20, totalNodes, true);

    const nodeArray = new Uint32Array(
      outputBuffer.buffer,
      this.HEADER_BYTE_SIZE,
      totalNodes,
    );
    for (let i = 0; i < totalNodes; i++) {
      nodeArray[i] = flatNodes[i]!;
    }

    const originalSize = mapWidth * mapHeight * 2;
    const quadtreeSize = totalBytes;
    const ratio = Number(
      (((originalSize - quadtreeSize) / originalSize) * 100).toFixed(2),
    );

    const stats: QuadtreeBuildStats = {
      originalSizeBytes: originalSize,
      quadtreeSizeBytes: quadtreeSize,
      compressionRatioPercent: ratio,
      totalNodesCount: totalNodes,
      leafNodesCount: leafCount,
      branchNodesCount: branchCount,
      maxDepth: 11,
    };

    return { buffer: outputBuffer, stats };
  }
}
