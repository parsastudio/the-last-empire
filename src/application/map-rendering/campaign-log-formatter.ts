export class CampaignLogFormatter {
  public formatInvasionLog(
    attackerId: string,
    targetId: string,
    conqueredCount: number,
    capitulatedCount: number,
  ): string {
    const total = conqueredCount + capitulatedCount;
    if (total === 0) {
      return `${attackerId} offensive against ${targetId} halted. No territorial gains achieved.`;
    }
    return `${attackerId} successfully captured ${total} operational cells from ${targetId} (Direct conquest: ${conqueredCount}, Capitulation: ${capitulatedCount}).`;
  }
}
