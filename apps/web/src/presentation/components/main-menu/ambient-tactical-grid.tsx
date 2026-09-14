import React from "react";

export function AmbientTacticalGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.12),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(16,185,129,0.08),transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      <div className="absolute top-1/4 -start-24 w-[32rem] h-[32rem] bg-primary/10 rounded-full blur-3xl animate-tactical-pulse" />
      <div className="absolute bottom-1/4 -end-24 w-[36rem] h-[36rem] bg-gdp/10 rounded-full blur-3xl animate-tactical-pulse" />
      <div className="absolute top-20 start-6 sm:top-24 sm:start-8 font-mono text-[9px] text-muted-foreground/40 tracking-widest hidden md:flex items-center gap-2 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-ping" />
        <span>SYS_REF: 44.2026.FA | EMPIRE_CORE</span>
      </div>
      <div className="absolute top-20 end-6 sm:top-24 sm:end-8 font-mono text-[9px] text-muted-foreground/40 tracking-widest hidden md:block select-none">
        GRID_LAT: 35.6892° N | LONG: 51.3890° E
      </div>
    </div>
  );
}
