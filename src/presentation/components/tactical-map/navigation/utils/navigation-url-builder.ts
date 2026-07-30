export class NavigationUrlBuilder {
  public static buildQueryString(
    params: Record<string, string | number | undefined | null>,
  ): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    }
    const query = searchParams.toString();
    return query ? `?${query}` : "";
  }
}
