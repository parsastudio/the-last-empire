export class OrganicCostNoise {
  private static readonly GRAD3: readonly [number, number][] = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  private static readonly PERM: Uint8Array = new Uint8Array([
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
    36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
    234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
    134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
    230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
    1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
    116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
    124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
    47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
    154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
    108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
    242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
    239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
    50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
    141, 128, 195, 78, 66, 215, 61, 156, 180,
  ]);

  private static readonly F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  private static readonly G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

  public static noise2D(xin: number, yin: number): number {
    let n0 = 0;
    let n1 = 0;
    let n2 = 0;

    const s = (xin + yin) * this.F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * this.G2;

    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1 = 0;
    let j1 = 0;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    const x1 = x0 - i1 + this.G2;
    const y1 = y0 - j1 + this.G2;
    const x2 = x0 - 1.0 + 2.0 * this.G2;
    const y2 = y0 - 1.0 + 2.0 * this.G2;

    const ii = i & 255;
    const jj = j & 255;

    const gi0 = this.PERM[(ii + this.PERM[jj]!) & 255]! % 8;
    const gi1 = this.PERM[(ii + i1 + this.PERM[(jj + j1) & 255]!) & 255]! % 8;
    const gi2 = this.PERM[(ii + 1 + this.PERM[(jj + 1) & 255]!) & 255]! % 8;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      const g0 = this.GRAD3[gi0]!;
      n0 = t0 * t0 * (g0[0] * x0 + g0[1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      const g1 = this.GRAD3[gi1]!;
      n1 = t1 * t1 * (g1[0] * x1 + g1[1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      const g2 = this.GRAD3[gi2]!;
      n2 = t2 * t2 * (g2[0] * x2 + g2[1] * y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }

  public static getTraverseCost(
    x: number,
    y: number,
    baseCost: number,
  ): number {
    const n1 = this.noise2D(x * 0.015, y * 0.015);
    const n2 = this.noise2D(x * 0.045 + 50, y * 0.045 + 50) * 0.5;
    const combinedNoise = (n1 + n2) * 0.45;
    const factor = Math.max(0.35, Math.min(1.9, 1.0 + combinedNoise));
    return Math.round(baseCost * factor);
  }
}
