export class CanalPreprocessor {
  public drawCanalWaterways(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.fillStyle = "rgb(0, 0, 0)";

    const suezX = Math.floor(width * 0.62);
    const suezY = Math.floor(height * 0.33);

    ctx.fillRect(suezX, suezY, 4, 12);

    const panamaX = Math.floor(width * 0.22);
    const panamaY = Math.floor(height * 0.48);

    ctx.fillRect(panamaX, panamaY, 4, 8);
  }
}
