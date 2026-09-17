import { GameAction } from "@/domain/game/action.schema";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { EspionageExecutionResult } from "@/domain/espionage/espionage.schema";
import { DiplomaticProposalFeedbackData } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/modals/components/treaty-response-feedback-content";

interface ProjectActionResult {
  isMilestoneReached?: boolean;
  isCompleted?: boolean;
}

export class ActionSoundResolverUtility {
  public static resolveAndPlay(action: GameAction, resultData?: unknown): void {
    switch (action.type) {
      case "RECRUIT_UNIT":
      case "BUY_ARMS_MARKET": {
        switch (action.unitType) {
          case "INFANTRY":
            TacticalSound.playInfantryRecruit();
            break;
          case "ARMOR":
            TacticalSound.playArmorRecruit();
            break;
          case "AIR_FORCE":
            TacticalSound.playAirForceRecruit();
            break;
          case "DRONE_MISSILE":
            TacticalSound.playMissileLaunch();
            break;
          case "AIR_DEFENSE":
          default:
            TacticalSound.playTechUpgrade();
            break;
        }
        break;
      }

      case "BUY_NAVAL_FLEET":
        TacticalSound.playNavalRecruit();
        break;

      case "BUILD_FACTORY":
        TacticalSound.playFactoryBuild();
        break;

      case "EQUIP_DOMESTIC_MACHINERY":
      case "BUY_INDUSTRIAL_EQUIPMENT":
        TacticalSound.playMachineryEquip();
        break;

      case "INVEST_INDUSTRIAL_RESEARCH":
      case "INVEST_RESEARCH":
        TacticalSound.playTechUpgrade();
        break;

      case "SET_ECONOMIC_DOCTRINE":
        TacticalSound.playTreatySigned();
        break;

      case "REQUEST_LOAN":
      case "REPAY_DEBT":
        TacticalSound.playImfLoan();
        break;

      case "BOOST_NATIONAL_PROJECT": {
        const projectData = resultData as ProjectActionResult | undefined;
        if (projectData?.isMilestoneReached || projectData?.isCompleted) {
          TacticalSound.playTechUpgrade();
        } else {
          TacticalSound.playCoinSound();
        }
        break;
      }

      case "RESOLVE_DILEMMA":
        TacticalSound.playTreatySigned();
        break;

      case "EXECUTE_ESPIONAGE_OPERATION": {
        const espResult = resultData as EspionageExecutionResult | undefined;
        if (action.tier === 1) {
          TacticalSound.playReconScan();
        } else if (action.tier === 2) {
          if (espResult?.outcome === "CLEAN_SUCCESS") {
            TacticalSound.playSabotageExplosion();
          } else {
            TacticalSound.playEspionageFailure();
          }
        } else if (action.tier === 3) {
          if (espResult?.outcome === "CLEAN_SUCCESS") {
            TacticalSound.playTechHeist();
          } else {
            TacticalSound.playEspionageFailure();
          }
        }
        break;
      }

      case "DIPLOMATIC_PROPOSAL": {
        const dipResult = resultData as
          | DiplomaticProposalFeedbackData
          | undefined;

        if (action.proposalType === "DECLARE_WAR") {
          TacticalSound.playWarDeclaration();
        } else if (action.proposalType === "SECURITY_GUARANTEE") {
          if (dipResult?.accepted) {
            TacticalSound.playSecurityGuarantee();
          } else {
            TacticalSound.playTreatyRejected();
          }
        } else if (action.proposalType === "EMERGENCY_PROTECTORATE") {
          TacticalSound.playProtectorateSigned();
        } else if (
          action.proposalType === "CANCEL_SECURITY_GUARANTEE" ||
          action.proposalType === "CANCEL_EMERGENCY_PROTECTORATE" ||
          action.proposalType === "CANCEL_TREATY"
        ) {
          TacticalSound.playTreatyRejected();
        } else if (action.proposalType === "SEND_FOREIGN_AID") {
          TacticalSound.playCoinSound();
        } else {
          if (dipResult?.accepted) {
            TacticalSound.playTreatySigned();
          } else if (dipResult && !dipResult.accepted) {
            TacticalSound.playTreatyRejected();
          }
        }
        break;
      }

      case "RESPOND_DIPLOMATIC_PROPOSAL":
        if (action.accept) {
          TacticalSound.playTreatySigned();
        } else {
          TacticalSound.playTreatyRejected();
        }
        break;

      case "SIGN_PEACE_SETTLEMENT":
        TacticalSound.playTreatySigned();
        break;

      case "INITIATE_BATTLE":
        TacticalSound.playWarDeclaration();
        break;

      default:
        break;
    }
  }
}
