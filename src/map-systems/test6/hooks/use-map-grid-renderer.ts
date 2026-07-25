import { useEffect, useRef } from "react";
import { GridState } from "@/engine/combat/state/grid-state";
import { RenderingPipelineFacade } from "../engine/rendering-pipeline-facade";

export function useMapGridRenderer(
  canvasDestRef: React.RefObject<HTMLCanvasElement | null>,
  gridState: GridState,
  loading: boolean,
  showHeatmap = false,
) {
  const pipeline = useRef(new RenderingPipelineFacade());

  useEffect(() => {
    const canvas = canvasDestRef.current;
    if (!canvas || loading) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const cells = gridState.getAllCells();

    pipeline.current.compositeFinalMap(
      imgData.data,
      canvas.width,
      canvas.height,
      cells,
      4,
      showHeatmap,
    );

    ctx.putImageData(imgData, 0, 0);
  }, [canvasDestRef, gridState, loading, showHeatmap]);
}
