import { z } from "zod";
import { EspionageTierSchema } from "@/domain/espionage/espionage.schema";

export const ExecuteEspionageActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("EXECUTE_ESPIONAGE_OPERATION"),
  targetNationId: z.string(),
  tier: EspionageTierSchema,
});

export type ExecuteEspionageAction = z.infer<
  typeof ExecuteEspionageActionSchema
>;
