import type { MilitaryStack } from "@/core/types";

export class ExperienceManager {
  private readonly maxExperience = 100;

  public addExperience(military: MilitaryStack, gain: number): MilitaryStack {
    const newExp = Math.min(this.maxExperience, military.experience + gain);
    return {
      ...military,
      experience: newExp,
    };
  }

  public getExperienceCombatMultiplier(experience: number): number {
    const base = 1.0;
    const maxBonus = 0.5;
    const bonus =
      (Math.min(this.maxExperience, experience) / this.maxExperience) *
      maxBonus;
    return Number((base + bonus).toFixed(2));
  }
}
