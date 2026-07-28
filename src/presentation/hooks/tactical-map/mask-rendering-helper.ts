import { MapShader } from "@/application/map-rendering/map-shader";

export interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

export class MaskRenderingHelper {
  public renderMask(
    img: HTMLImageElement,
    mapWidth: number,
    mapHeight: number,
    canvasSrc: HTMLCanvasElement,
    canvasShaded: HTMLCanvasElement,
    countriesData: CountryMapping[],
    maskDataRef: { current: Uint8Array | null },
  ): void {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = mapWidth;
    tempCanvas.height = mapHeight;

    const tempCtx = tempCanvas.getContext("2d");
    const raw = new Uint8Array(mapWidth * mapHeight * 2);
    if (tempCtx) {
      tempCtx.drawImage(img, 0, 0);
      const imgData = tempCtx.getImageData(0, 0, mapWidth, mapHeight);
      for (let i = 0; i < mapWidth * mapHeight; i++) {
        raw[i * 2] = imgData.data[i * 4 + 1] || 0;
        raw[i * 2 + 1] = imgData.data[i * 4 + 2] || 0;
      }
      maskDataRef.current = raw;
    }

    canvasSrc.width = mapWidth;
    canvasSrc.height = mapHeight;
    canvasShaded.width = mapWidth;
    canvasShaded.height = mapHeight;

    const ctxSrc = canvasSrc.getContext("2d");
    const ctxShaded = canvasShaded.getContext("2d");

    if (ctxSrc && ctxShaded && maskDataRef.current) {
      ctxSrc.imageSmoothingEnabled = false;
      ctxShaded.imageSmoothingEnabled = true;
      ctxSrc.drawImage(img, 0, 0, mapWidth, mapHeight);

      const srcData = ctxSrc.getImageData(0, 0, mapWidth, mapHeight).data;
      const destImage = ctxShaded.createImageData(mapWidth, mapHeight);

      const nationMaskOnly = new Uint8Array(mapWidth * mapHeight);
      for (let i = 0; i < mapWidth * mapHeight; i++) {
        nationMaskOnly[i] = maskDataRef.current[i * 2 + 1] || 0;
      }

      MapShader.applyShading(
        srcData,
        destImage.data,
        mapWidth,
        mapHeight,
        nationMaskOnly,
        countriesData,
      );

      ctxShaded.putImageData(destImage, 0, 0);
    }
  }
}
