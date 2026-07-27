import { AIPersonalityType } from "@/domain/ai/ai.schema";

export class PersonalityResolver {
  public resolveDeterministic(
    nationId: string,
    gameId: string,
    seed: number,
  ): AIPersonalityType {
    const list: AIPersonalityType[] = [
      "AGGRESSIVE",
      "PACIFIST",
      "ECONOMIC",
      "ISOLATIONIST",
    ];
    let hash = seed;
    for (let i = 0; i < gameId.length; i++) {
      hash += gameId.charCodeAt(i);
    }
    for (let i = 0; i < nationId.length; i++) {
      hash += nationId.charCodeAt(i);
    }
    return list[Math.abs(hash) % list.length] || "ECONOMIC";
  }
}
