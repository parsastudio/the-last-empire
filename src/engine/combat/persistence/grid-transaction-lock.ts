export class GridTransactionLock {
  private isLocked = false;

  public async acquireLock(): Promise<boolean> {
    if (this.isLocked) {
      return false;
    }
    this.isLocked = true;
    return true;
  }

  public releaseLock(): void {
    this.isLocked = false;
  }
}
