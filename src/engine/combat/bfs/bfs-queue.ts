export class BfsQueue<T> {
  private list: T[] = [];
  private head = 0;

  public enqueue(item: T): void {
    this.list.push(item);
  }

  public dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const item = this.list[this.head];
    this.head++;
    return item;
  }

  public isEmpty(): boolean {
    return this.head >= this.list.length;
  }

  public size(): number {
    return this.list.length - this.head;
  }

  public clear(): void {
    this.list = [];
    this.head = 0;
  }
}
