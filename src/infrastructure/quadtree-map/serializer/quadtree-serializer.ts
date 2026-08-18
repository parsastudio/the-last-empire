import {
  QuadtreeNode,
  QuadtreeBuildStats,
} from "@/infrastructure/quadtree-map/core/quadtree-types";

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
    const flatNodes: number[] = [];
    let leafCount = 0;
    let branchCount = 0;

    const rootWestIdx = this.flattenNode(
      rootWest,
      flatNodes,
      () => leafCount++,
      () => branchCount++,
    );
    const rootEastIdx = this.flattenNode(
      rootEast,
      flatNodes,
      () => leafCount++,
      () => branchCount++,
    );

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

  private static flattenNode(
    node: QuadtreeNode,
    flatNodes: number[],
    onLeaf: () => void,
    onBranch: () => void,
  ): number {
    if (node.isLeaf) {
      onLeaf();
      const nodeIndex = flatNodes.length;
      const leafValue = this.LEAF_BIT_FLAG | (node.provinceId & 0xffff);
      flatNodes.push(leafValue);
      return nodeIndex;
    }

    onBranch();
    const branchIndex = flatNodes.length;
    flatNodes.push(0);

    const childIndices: [number, number, number, number] = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      childIndices[i] = this.flattenNode(
        node.children[i],
        flatNodes,
        onLeaf,
        onBranch,
      );
    }

    const firstChildOffset = childIndices[0];
    flatNodes[branchIndex] = firstChildOffset & 0x7fffffff;

    return branchIndex;
  }
}
