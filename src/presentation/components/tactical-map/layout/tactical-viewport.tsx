import React, { useEffect } from "react";

interface TacticalViewportProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasDestRef: React.RefObject<HTMLCanvasElement | null>;
  isDragging: boolean;
  isHoveringCountry?: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

export function TacticalViewport({
  containerRef,
  canvasDestRef,
  isDragging,
  isHoveringCountry = false,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onClick,
  children,
}: TacticalViewportProps) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNonPassiveWheel = (e: WheelEvent) => {
      e.preventDefault();
      const syntheticEvent = e as unknown as React.WheelEvent<HTMLDivElement>;
      onWheel(syntheticEvent);
    };

    container.addEventListener("wheel", handleNonPassiveWheel, {
      passive: false,
    });

    return () => {
      container.removeEventListener("wheel", handleNonPassiveWheel);
    };
  }, [containerRef, onWheel]);

  const getCursorClass = () => {
    if (isDragging) return "cursor-grabbing";
    if (isHoveringCountry) return "cursor-pointer";
    return "cursor-default";
  };

  return (
    <div
      ref={containerRef}
      className={`w-screen h-screen absolute inset-0 bg-slate-950 overflow-hidden ${getCursorClass()}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={onClick}
    >
      <canvas
        ref={canvasDestRef}
        className="pointer-events-none absolute inset-0 w-full h-full block"
      />
      {children}
    </div>
  );
}
