import { NationDatabaseProvider } from "../utils/nation-database-provider";
import { NationDetail } from "../nation-list-item";

const provider = new NationDatabaseProvider();
export const NATIONS_DATABASE: NationDetail[] =
  provider.getAllSelectableNations();
