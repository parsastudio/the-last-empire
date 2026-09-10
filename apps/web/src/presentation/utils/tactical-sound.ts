import {
  SoundEffectId,
  SOUND_PRESETS,
} from "@/presentation/configs/tactical-sound-presets.config";
import { TacticalSoundSynthesizer } from "@/presentation/utils/sound/tactical-sound-synthesizer";

export type { SoundEffectId };

export class TacticalSound {
  private static readonly synthesizer = TacticalSoundSynthesizer.getInstance();
  private static lastHoverTime = 0;
  private static lastSliderTime = 0;

  private static muted: boolean =
    typeof window !== "undefined"
      ? localStorage.getItem("tactical_sound_muted") === "true"
      : false;

  private static masterVolume = 0.8;

  public static isMuted(): boolean {
    return this.muted;
  }

  public static setMuted(mute: boolean): void {
    this.muted = mute;
    if (typeof window !== "undefined") {
      localStorage.setItem("tactical_sound_muted", String(mute));
    }
    this.synthesizer.setMasterVolume(this.masterVolume, this.muted);
  }

  public static toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public static setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.synthesizer.setMasterVolume(this.masterVolume, this.muted);
  }

  public static getVolume(): number {
    return this.masterVolume;
  }

  public static play(soundId: SoundEffectId): void {
    if (this.muted) return;
    const preset = SOUND_PRESETS[soundId];
    if (!preset) return;
    this.synthesizer.synthesize(preset);
  }

  public static playUiClick(): void {
    this.play("UI_CLICK");
  }

  public static playMapHover(): void {
    const now = Date.now();
    if (now - this.lastHoverTime < 75) return;
    this.lastHoverTime = now;
    this.play("MAP_HOVER");
  }

  public static playSliderTick(): void {
    const now = Date.now();
    if (now - this.lastSliderTime < 40) return;
    this.lastSliderTime = now;
    this.play("SLIDER_TICK");
  }

  public static playContextMenu(): void {
    this.play("CONTEXT_MENU");
  }

  public static playModalOpen(): void {
    this.play("MODAL_OPEN");
  }

  public static playModalClose(): void {
    this.play("MODAL_CLOSE");
  }

  public static playToastAlert(
    type: "info" | "warning" | "error" | "success" = "info",
  ): void {
    switch (type) {
      case "success":
        this.play("TOAST_SUCCESS");
        break;
      case "warning":
        this.play("TOAST_WARNING");
        break;
      case "error":
        this.play("TOAST_ERROR");
        break;
      case "info":
      default:
        this.play("TOAST_INFO");
        break;
    }
  }

  public static playTurnAdvance(): void {
    this.play("TURN_ADVANCE");
  }

  public static playCoinSound(): void {
    this.play("COIN");
  }

  public static playInfantryRecruit(): void {
    this.play("INFANTRY_RECRUIT");
  }

  public static playArmorRecruit(): void {
    this.play("ARMOR_RECRUIT");
  }

  public static playAirForceRecruit(): void {
    this.play("AIR_FORCE_RECRUIT");
  }

  public static playMissileLaunch(): void {
    this.play("MISSILE_LAUNCH");
  }

  public static playNavalRecruit(): void {
    this.play("NAVAL_RECRUIT");
  }

  public static playTechUpgrade(): void {
    this.play("TECH_UPGRADE");
  }

  public static playFactoryBuild(): void {
    this.play("FACTORY_BUILD");
  }

  public static playMachineryEquip(): void {
    this.play("MACHINERY_EQUIP");
  }

  public static playImfLoan(): void {
    this.play("IMF_LOAN");
  }

  public static playTreatySigned(): void {
    this.play("TREATY_SIGNED");
  }

  public static playTreatyRejected(): void {
    this.play("TREATY_REJECTED");
  }

  public static playWarDeclaration(): void {
    this.play("WAR_DECLARATION");
  }

  public static playCoalitionAlarm(): void {
    this.play("COALITION_ALARM");
  }

  public static playSecurityGuarantee(): void {
    this.play("SECURITY_GUARANTEE");
  }

  public static playProtectorateSigned(): void {
    this.play("PROTECTORATE_SIGNED");
  }

  public static playReconScan(): void {
    this.play("RECON_SCAN");
  }

  public static playSabotageExplosion(): void {
    this.play("SABOTAGE_EXPLOSION");
  }

  public static playTechHeist(): void {
    this.play("TECH_HEIST");
  }

  public static playEspionageFailure(): void {
    this.play("ESPIONAGE_FAILURE");
  }

  public static playPhaseMissile(): void {
    this.play("PHASE_MISSILE");
  }

  public static playPhaseAir(): void {
    this.play("PHASE_AIR");
  }

  public static playPhaseGround(): void {
    this.play("PHASE_GROUND");
  }

  public static playDilemmaAlert(): void {
    this.play("DILEMMA_ALERT");
  }

  public static playVictoryFanfare(): void {
    this.play("VICTORY_FANFARE");
  }

  public static playDefeatSound(): void {
    this.play("DEFEAT_SOUND");
  }
}
