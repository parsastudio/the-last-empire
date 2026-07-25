import type { GeoJsonData } from "@/map-systems/test1/engine/grid-generator";

export const FALLBACK_WORLD_MAP: GeoJsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        ISO_A3: "USA",
        NAME: "United States",
        POP_EST: 328239523,
        GDP_MD: 21433225,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-124.8, 49.0],
            [-124.8, 24.5],
            [-66.9, 24.5],
            [-66.9, 49.0],
            [-124.8, 49.0],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        ISO_A3: "CAN",
        NAME: "Canada",
        POP_EST: 37589262,
        GDP_MD: 1736425,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-141.0, 83.0],
            [-141.0, 49.0],
            [-52.6, 49.0],
            [-52.6, 83.0],
            [-141.0, 83.0],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        ISO_A3: "RUS",
        NAME: "Russia",
        POP_EST: 144373535,
        GDP_MD: 1699876,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [19.6, 81.8],
            [19.6, 41.1],
            [180.0, 41.1],
            [180.0, 81.8],
            [19.6, 81.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        ISO_A3: "DEU",
        NAME: "Germany",
        POP_EST: 83132799,
        GDP_MD: 3861123,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [5.8, 55.0],
            [5.8, 47.2],
            [15.0, 47.2],
            [15.0, 55.0],
            [5.8, 55.0],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        ISO_A3: "IRN",
        NAME: "Iran",
        POP_EST: 83992949,
        GDP_MD: 450000,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [44.0, 39.7],
            [44.0, 25.0],
            [63.3, 25.0],
            [63.3, 39.7],
            [44.0, 39.7],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        ISO_A3: "SAU",
        NAME: "Saudi Arabia",
        POP_EST: 34268528,
        GDP_MD: 792966,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [34.5, 32.1],
            [34.5, 16.3],
            [55.6, 16.3],
            [55.6, 32.1],
            [34.5, 32.1],
          ],
        ],
      },
    },
  ],
};
