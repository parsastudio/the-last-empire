<img width="1920" height="923" alt="image" src="https://github.com/user-attachments/assets/bc9c7c8c-0b8e-4927-9f21-744c085981e6" />
<img width="1920" height="923" alt="image" src="https://github.com/user-attachments/assets/06311f68-ed95-4b89-b1bb-dd8c1012a645" />
<img width="1920" height="923" alt="image" src="https://github.com/user-attachments/assets/d08d2210-39ec-4e55-bbb3-aa2637e5b9a0" />
<img width="1920" height="923" alt="image" src="https://github.com/user-attachments/assets/eab2ee91-232d-46bb-9f08-131515357edc" />

# The Last Empire | آخرین امپراتوری

<p align="center">
  <strong>A modern, high-performance Grand Strategy & Geopolitical Simulation engine built on Next.js 16, TypeScript, WebGL2, and Clean Domain-Driven Architecture.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS v4" /></a>
  <a href="https://turbo.build"><img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo" alt="Turborepo" /></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext"><img src="https://img.shields.io/badge/WebGL2-GPU_Hardware_Accelerated-990000?style=for-the-badge&logo=webgl" alt="WebGL2" /></a>
  <a href="https://dexie.com"><img src="https://img.shields.io/badge/Dexie.js-IndexedDB_Offline-10B981?style=for-the-badge" alt="Dexie.js" /></a>
  <a href="https://web.dev/progressive-web-apps/"><img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa" alt="PWA Ready" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License: MIT" /></a>
</p>

---

## Overview

**The Last Empire** is a browser-based, turn-driven geopolitical statecraft and grand strategy simulation. Players take the reins of any sovereign nation to balance macroeconomics, industrial supply chains, advanced R&D, diplomatic security umbrellas, cyber intelligence, and land-or-sea military campaigns across a high-resolution world map.

Built with performance, strict type safety, and offline resilience in mind, the platform renders thousands of territorial subdivisions via a dedicated **WebGL2 GPU rasterizer** operating directly on compact **bit-packed binary state buffers**, allowing smooth 60+ FPS navigation even on mobile devices.

---

## Architectural Highlights

- **Hexagonal / Clean Architecture**: Strict unidirectional dependency flow. Pure domain rules (`@geopolitics/domain`) and deterministic simulation executors (`@geopolitics/game-engine`) are completely decoupled from UI views and rendering frameworks.
- **Custom WebGL2 World Renderer**: Direct-to-GPU rasterization of a 4096×2048 world map. State palettes, political boundaries, territorial borders, and GDP heatmaps are computed in custom GLSL vertex and fragment shaders without DOM bloat.
- **Bit-Packed Memory Efficiency**: Compact province data cells and dynamic territorial state stored inside `Uint8Array` / `Uint16Array` buffers, minimizing memory footprint and enabling instantaneous saves.
- **Deterministic Simulation Pipeline**: State progression is orchestrated through atomic pipeline stages (Economy & Fiscal -> Politics & Victory -> Diplomacy & AI -> Combat Resolutions -> Turn Log Synchronizer) seeded via a deterministic PRNG.
- **Offline-First Resilience**: Full offline execution powered by Service Workers, IndexedDB (`Dexie.js`), and self-healing binary asset synchronization via `requestIdleCallback`.
- **Procedural Web Audio Engine**: Zero-asset audio architecture. All UI interactions, combat phases, alarms, and musical fanfares are synthesized directly through the browser's `AudioContext` with zero network overhead.
- **Full Bi-directional Localization (i18n)**: Seamless English (`LTR`) and Persian (`RTL`) support with custom tactical numeral formatting and localized country dossiers.

---

## Core Systems

### 1. Macroeconomics & Industrial Tiers

- **Gross Domestic Product & National Budget**: Fiscal revenues calculated using economic doctrines (_Autarky_, _Protectionism_, _Balanced Mixed_, _Free Trade_, _Mercantile Hub_).
- **Multi-Tier Factory Modernization**: Real-time management of assembly sheds across domestic provinces and foreign machinery import markets.
- **IMF Credit Line & Debt Ceiling**: Emergency lending facilities tied to a 30% GDP ceiling with realistic debt service obligations and bankruptcy penalties.

### 2. Tactical 3-Phase Combat Engine

- **Phase I: Ballistic Salvos vs. Integrated Air Defense**: Strategic strikes targeting command structures, air defense batteries, and manufacturing hubs.
- **Phase II: Air Dominance & Dogfights**: Air-to-air battles and Close Air Support (CAS) targeting heavy armor.
- **Phase III: Combined-Arms Ground Clash**: Dynamic clashing of armor divisions, motorized infantry, and defensive redoubts.
- **Casualty & Spoils Resolution**: Accurate after-action reports factoring in military hardware attrition, captured pixels, annexed provinces, population gains, and looted treasuries.

### 3. Statecraft & Geopolitical Diplomacy

- **Strategic Bilateral Treaties**: Non-Aggression Pacts, Strategic Economic Partnerships, and Mutual Territorial Defense Accords.
- **Colonial Protectorates**: Emergency security guarantees providing superpower garrison strike forces in exchange for recurring tribute.
- **Global Containment Coalitions**: Autonomous AI superpower alignment triggered dynamically when a hegemon's rapid expansion threatens world equilibrium.
- **Calculated Peace Settlements**: Multi-variable peace terms evaluator featuring war reparations, territorial concessions, and capitulations.

### 4. Intelligence & Covert Ops

- **Satellite Reconnaissance**: Penetrating fog-of-war to uncover enemy troop compositions and third-party defense guarantors.
- **Tactical Sabotage**: Covert detonation of frontline air defense systems, armor formations, and aircraft hangars.
- **Industrial & Military Cyber Heists**: High-stakes technological espionage siphoning military and manufacturing research blueprints.

---

## Monorepo Layout

```
.
├── apps/
│   └── web/                     # Next.js 16 App Router interface & presentation layer
│       ├── messages/            # Structured i18n dictionaries (en / fa)
│       └── src/
│           ├── app/             # Internationalized route handlers & layout shells
│           ├── infrastructure/  # Dexie IndexedDB repositories & binary loaders
│           └── presentation/    # Pure presentational components, hooks & WebGL canvas
│
└── packages/
    ├── domain/                  # Zod schemas, registries, contracts & mathematical utilities
    ├── game-engine/             # Turn pipeline, AI utility scoring, combat & diplomacy executors
    └── map-pipeline/            # Terrain binary compilers, Lloyd relaxation & graph builders
```

---

## Tech Stack

| Layer                  | Technology                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **Framework**          | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Fast Refresh)                 |
| **Runtime & Language** | [React 19](https://react.dev/), [TypeScript 5.x](https://www.typescriptlang.org/) (Strict Mode) |
| **Monorepo Engine**    | [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/)                                    |
| **Styling & Design**   | [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons                                       |
| **State & Storage**    | [Zustand](https://github.com/pmndrs/zustand), [Dexie.js](https://dexie.org/) (IndexedDB v2)     |
| **Graphics & Shaders** | Custom WebGL2 (GLSL Vertex & Fragment Shaders, Texture Units)                                   |
| **Audio**              | Native Web Audio API (`AudioContext`, Custom Synthesizer)                                       |
| **Localization**       | [next-intl](https://next-intl-docs.vercel.app/) with customized RTL/LTR layouts                 |

---

## Getting Started

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.x

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/parsastudio/the-last-empire.git
cd the-last-empire
pnpm install
```

### 2. Development Mode

Launch all workspaces in parallel via Turborepo:

```bash
pnpm dev
```

Navigate to `http://localhost:3000` in your browser.

### 3. Production Build

Verify types and generate optimized standalone production bundles:

```bash
pnpm build
pnpm start
```

### 4. Code Quality & Formatting

```bash
pnpm lint
pnpm type-check
```

---

## Performance & Optimization Standards

- **Zero Unnecessary Rerenders**: Zustand fine-grained selectors and memoized view models ensure UI components only update when their relevant slices change.
- **Off-Thread Processing**: Intensive binary decompression and state caching scheduled using `requestIdleCallback` and `requestAnimationFrame`.
- **Asset Size Economy**: Complete game engine and spatial map assets packaged into compressed binary textures, avoiding heavy multi-megabyte geo-JSON payloads.
- **Hardware-Aware Layouts**: Device orientation guards lock tactical workspace displays to landscape mode for war-room interfaces.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```

```
