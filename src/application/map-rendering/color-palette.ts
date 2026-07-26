export const MAP_PALETTE_172: [number, number, number][] = (() => {
  const list: [number, number, number][] = [];
  const baseColors: [number, number, number][] = [
    [222, 206, 185],
    [194, 205, 184],
    [216, 188, 178],
    [210, 188, 193],
    [225, 210, 178],
    [182, 202, 196],
    [190, 202, 212],
    [220, 194, 184],
    [205, 210, 182],
    [200, 194, 210],
  ];

  for (let i = 0; i < 172; i++) {
    const base = baseColors[i % baseColors.length]!;
    const seed = i * 13.37;
    const rShift = Math.floor(Math.sin(seed) * 3 - 1.5);
    const gShift = Math.floor(Math.sin(seed + 1) * 3 - 1.5);
    const bShift = Math.floor(Math.sin(seed + 2) * 3 - 1.5);

    list.push([
      Math.max(175, Math.min(235, base[0] + rShift)),
      Math.max(175, Math.min(235, base[1] + gShift)),
      Math.max(175, Math.min(235, base[2] + bShift)),
    ]);
  }
  return list;
})();
