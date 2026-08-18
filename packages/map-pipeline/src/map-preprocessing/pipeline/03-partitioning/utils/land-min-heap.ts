export class LandMinHeap {
  private nodes: { idx: number; dist: number }[] = [];

  public push(idx: number, dist: number): void {
    this.nodes.push({ idx, dist });
    this.bubbleUp(this.nodes.length - 1);
  }

  public pop(): { idx: number; dist: number } | undefined {
    if (this.nodes.length === 0) return undefined;
    const top = this.nodes[0]!;
    const bottom = this.nodes.pop()!;
    if (this.nodes.length > 0) {
      this.nodes[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  public size(): number {
    return this.nodes.length;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.nodes[i]!.dist < this.nodes[p]!.dist) {
        const tmp = this.nodes[i]!;
        this.nodes[i] = this.nodes[p]!;
        this.nodes[p] = tmp;
        i = p;
      } else {
        break;
      }
    }
  }

  private sinkDown(i: number): void {
    const len = this.nodes.length;
    while (true) {
      const left = (i << 1) + 1;
      const right = left + 1;
      let smallest = i;

      if (left < len && this.nodes[left]!.dist < this.nodes[smallest]!.dist) {
        smallest = left;
      }
      if (right < len && this.nodes[right]!.dist < this.nodes[smallest]!.dist) {
        smallest = right;
      }

      if (smallest !== i) {
        const tmp = this.nodes[i]!;
        this.nodes[i] = this.nodes[smallest]!;
        this.nodes[smallest] = tmp;
        i = smallest;
      } else {
        break;
      }
    }
  }
}
