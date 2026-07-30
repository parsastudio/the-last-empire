export class DeterministicIdGenerator {
  public generateActionId(
    actionType: string,
    nationId: string,
    turn: number,
    sequenceIndex: number,
  ): string {
    const cleanType = actionType.toLowerCase().replace(/_/g, "-");
    const cleanNation = nationId.replace("NATION_", "");
    return `ai-${cleanType}-${cleanNation}-t${turn}-s${sequenceIndex}`;
  }
}
