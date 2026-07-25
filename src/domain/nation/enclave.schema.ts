import { z } from "zod";
import { CoordinateSchema } from "@/domain/map/coordinate.schema";

export const EnclaveMetaSchema = z.object({
  enclaveId: z.number().positive(),
  originalCountryId: z.string(),
  originalName: z.string(),
  centerCoordinate: CoordinateSchema,
});

export type EnclaveMeta = z.infer<typeof EnclaveMetaSchema>;
