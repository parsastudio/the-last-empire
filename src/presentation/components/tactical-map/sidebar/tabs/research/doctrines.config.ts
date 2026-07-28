export interface DoctrineItem {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
}

export const INITIAL_DOCTRINES: DoctrineItem[] = [
  { id: "gdp-booster", name: "خطوط تولید اتوماتیک", cost: 3, unlocked: true },
  { id: "low-upkeep", name: "شبکه لجستیک سبز", cost: 5, unlocked: false },
  {
    id: "border-fortification",
    name: "پروتکل‌های استقرار مرزی",
    cost: 3,
    unlocked: false,
  },
  {
    id: "drone-swarm",
    name: "تسلیحات شبکه‌ای پهپادی",
    cost: 5,
    unlocked: false,
  },
];
