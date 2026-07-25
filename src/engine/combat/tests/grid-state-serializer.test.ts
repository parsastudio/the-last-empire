import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridStateSerializer } from "@/engine/combat/persistence/grid-state-serializer";
import { GridStateDeserializer } from "@/engine/combat/persistence/grid-state-deserializer";

export function runGridStateSerializerTest(): boolean {
  const serializer = new GridStateSerializer();
  const deserializer = new GridStateDeserializer();
  const mockCells: GridCell[] = [
    {
      x: 0,
      y: 0,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 0,
    },
  ];
  const serialized = serializer.serialize(mockCells);
  const deserialized = deserializer.deserialize(serialized);
  return deserialized.length === 1 && deserialized[0]?.ownerId === "USA";
}
