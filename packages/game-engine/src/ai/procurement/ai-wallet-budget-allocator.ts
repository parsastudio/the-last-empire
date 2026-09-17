import { AIPosture } from "@/engine/ai/procurement/ai-posture-evaluator";

export interface AiStrategicWallets {
  innovation: number;
  globalMarket: number;
  domesticInfra: number;
  geopolitics: number;
  totalDisposable: number;
  isEmbargoed: boolean;
  posture: AIPosture;
}
