export class QuadtreeReader {
  private static readonly LEAF_BIT_FLAG = 0x80000000;
  private static readonly HEADER_BYTE_SIZE = 24;

  private mapWidth: number;
  private mapHeight: number;
  private rootWestIndex: number;
  private rootEastIndex: number;
  private totalNodes: number;
  private nodeArray: Uint32Array;

  constructor(source: ArrayBufferLike | Uint8Array) {
    const view = source instanceof Uint8Array ? source : new Uint8Array(source);
    const dataView = new DataView(
      view.buffer,
      view.byteOffset,
      view.byteLength,
    );
    const magic = dataView.getUint32(0, true);
    if (magic !== 0x51545245) {
      throw new Error("Invalid Quadtree binary header signature.");
    }

    this.mapWidth = dataView.getUint16(6, true);
    this.mapHeight = dataView.getUint16(8, true);
    this.rootWestIndex = dataView.getUint32(12, true);
    this.rootEastIndex = dataView.getUint32(16, true);
    this.totalNodes = dataView.getUint32(20, true);

    const headerOffset = view.byteOffset + QuadtreeReader.HEADER_BYTE_SIZE;
    this.nodeArray = new Uint32Array(
      view.buffer,
      headerOffset,
      this.totalNodes,
    );
  }

  public getProvinceId(x: number, y: number): number {
    const clampedX = Math.floor(x);
    const clampedY = Math.floor(y);

    if (
      clampedX < 0 ||
      clampedX >= this.mapWidth ||
      clampedY < 0 ||
      clampedY >= this.mapHeight
    ) {
      return 0;
    }

    const isEast = clampedX >= 2048;
    let currentNodeIndex = isEast ? this.rootEastIndex : this.rootWestIndex;
    const localX = isEast ? clampedX - 2048 : clampedX;
    const localY = clampedY;

    let nodeSize = 2048;
    let nodeX = 0;
    let nodeY = 0;

    while (nodeSize > 0) {
      const nodeWord = this.nodeArray[currentNodeIndex]!;

      if ((nodeWord & QuadtreeReader.LEAF_BIT_FLAG) !== 0) {
        return nodeWord & 0xffff;
      }

      const half = nodeSize >> 1;
      const midX = nodeX + half;
      const midY = nodeY + half;

      const isRight = localX >= midX;
      const isBottom = localY >= midY;

      const quadrant = (isBottom ? 2 : 0) + (isRight ? 1 : 0);

      nodeX = isRight ? midX : nodeX;
      nodeY = isBottom ? midY : nodeY;
      nodeSize = half;

      const childrenBaseOffset = nodeWord & 0x7fffffff;
      currentNodeIndex = childrenBaseOffset + quadrant;
    }

    return 0;
  }

  public getWidth(): number {
    return this.mapWidth;
  }

  public getHeight(): number {
    return this.mapHeight;
  }

  public getTotalNodes(): number {
    return this.totalNodes;
  }

  public getByteSize(): number {
    return QuadtreeReader.HEADER_BYTE_SIZE + this.totalNodes * 4;
  }
}
