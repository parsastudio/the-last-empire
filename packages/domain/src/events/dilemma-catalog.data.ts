import { DilemmaEvent } from "@/domain/events/dilemma.schema";
import { ECONOMIC_DILEMMA_EVENTS } from "@/domain/events/sources/economic-dilemmas.data";
import { DOMESTIC_DILEMMA_EVENTS } from "@/domain/events/sources/domestic-dilemmas.data";
import { GEOPOLITICAL_DILEMMA_EVENTS } from "@/domain/events/sources/geopolitical-dilemmas.data";
import { ESPIONAGE_DILEMMA_EVENTS } from "@/domain/events/sources/espionage-dilemmas.data";
import { MILITARY_DILEMMA_EVENTS } from "@/domain/events/sources/military-dilemmas.data";

export const CORE_DILEMMA_EVENTS: readonly DilemmaEvent[] = Object.freeze([
  ...ECONOMIC_DILEMMA_EVENTS,
  ...DOMESTIC_DILEMMA_EVENTS,
  ...GEOPOLITICAL_DILEMMA_EVENTS,
  ...ESPIONAGE_DILEMMA_EVENTS,
  ...MILITARY_DILEMMA_EVENTS,
]);
