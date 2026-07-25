export class GridStateIndexedDbValidator {
  public validateDatabaseRecord(record: {
    gameId: string;
    data: string;
  }): boolean {
    return typeof record.gameId === "string" && typeof record.data === "string";
  }
}
