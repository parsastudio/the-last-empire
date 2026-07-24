export let STATIC_ADJACENCY_LIST: Record<string, string[]> = {};

export function setStaticAdjacencyList(list: Record<string, string[]>): void {
  STATIC_ADJACENCY_LIST = list;
}
