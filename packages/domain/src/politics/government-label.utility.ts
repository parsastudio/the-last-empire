import { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentOption {
  type: GovernmentType;
}

export const GOVERNMENT_OPTIONS: GovernmentOption[] = [
  { type: "PLURALIST_PARLIAMENTARY" },
  { type: "CENTRALIZED_PRESIDENTIAL" },
  { type: "IDEOLOGICAL_REGIME" },
  { type: "HEREDITARY_MONARCHY" },
  { type: "TECHNOCRATIC_ONE_PARTY" },
];
