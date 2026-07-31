import { ActionValidator } from "../validators/action-validator.interface";
import { ProxyInfluenceValidator } from "../validators/proxy-influence.validator";
import { DoctrineUnlockValidator } from "../validators/doctrine-unlock.validator";
import { AntiCorruptionValidator } from "../validators/anti-corruption.validator";
import { ActivateAbilityValidator } from "../validators/activate-ability.validator";

export function getPoliticsValidators(): ActionValidator[] {
  return [
    new ProxyInfluenceValidator(),
    new DoctrineUnlockValidator(),
    new AntiCorruptionValidator(),
    new ActivateAbilityValidator(),
  ];
}
