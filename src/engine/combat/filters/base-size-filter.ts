export class BaseSizeFilter {
  private readonly minBaseAreaSqKm = 50000;

  public isEligibleAsBase(theaterAreaSqKm: number): boolean {
    return theaterAreaSqKm >= this.minBaseAreaSqKm;
  }
}
