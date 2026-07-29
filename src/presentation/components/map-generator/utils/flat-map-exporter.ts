export class FlatMapExporter {
  public exportFlatMap(mapType: "default" | "edited" | "partition"): void {
    const img = new Image();
    let srcPath = "/maps/map1/default-mask.png";
    if (mapType === "edited") {
      srcPath = "/maps/map1/edited-mask.png";
    } else if (mapType === "partition") {
      srcPath = "/maps/map1/partition-mask.png";
    }
    img.src = srcPath;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, 4096, 2048);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const b = data[i + 2];
        if (b !== undefined && b >= 11) {
          data[i] = 150 + ((b * 7) % 105);
          data[i + 1] = 100 + ((b * 13) % 120);
          data[i + 2] = b;
        } else if (b !== undefined) {
          data[i] = 20;
          data[i + 1] = 30;
          data[i + 2] = b;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const link = document.createElement("a");
      link.download = "world-flat-edit.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  }
}
