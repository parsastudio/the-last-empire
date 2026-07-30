export interface Doctrine {
  id: string;
  name: string;
  branch: "INDUSTRIAL_TECH" | "ASYMMETRIC_MILITARY" | "DIPLOMATIC_HEGEMONY";
  cost: number;
}

export const DEFAULT_DOCTRINES: Doctrine[] = [
  {
    id: "gdp-booster",
    name: "Automation Pipelines",
    branch: "INDUSTRIAL_TECH",
    cost: 3,
  },
  {
    id: "low-upkeep",
    name: "Green Logistics Grid",
    branch: "INDUSTRIAL_TECH",
    cost: 5,
  },
  {
    id: "border-fortification",
    name: "Garrison Protocols",
    branch: "ASYMMETRIC_MILITARY",
    cost: 3,
  },
  {
    id: "global-influence",
    name: "Cultural Radiance",
    branch: "DIPLOMATIC_HEGEMONY",
    cost: 3,
  },
  {
    id: "reputation-recovery",
    name: "Media Hegemony",
    branch: "DIPLOMATIC_HEGEMONY",
    cost: 5,
  },
];
