import { z } from "zod";

export const ExportSalesBuyerItemSchema = z.object({
  nationId: z.string().min(1),
  amount: z.number().nonnegative(),
});

export const ExportSalesModalDataSchema = z.object({
  buyers: z.array(ExportSalesBuyerItemSchema),
  totalProfit: z.number().nonnegative(),
  turn: z.number().nonnegative(),
});

export type ExportSalesBuyerItem = z.infer<typeof ExportSalesBuyerItemSchema>;
export type ExportSalesModalData = z.infer<typeof ExportSalesModalDataSchema>;
