import { z } from "zod";
import { SidebarTabType } from "../../sidebar/sidebar-tabs";

export const NavigationParamsSchema = z.object({
  tab: z.string().optional(),
  subTab: z.string().optional(),
  target: z.string().optional(),
  modal: z.string().optional(),
});

export type NavigationParams = z.infer<typeof NavigationParamsSchema>;

export interface NavigationNode {
  id: string;
  tab: SidebarTabType;
  subTab?: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  keywords: string[];
}
