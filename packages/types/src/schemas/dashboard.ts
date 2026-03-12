import {z} from 'zod';

const unsupportedDashboardTotal = z.number().int().nonnegative().default(0);

export const attachmentCountsSchema = z.strictObject({
  image: z.number().int().nonnegative(),
  document: z.number().int().nonnegative(),
  video: z.number().int().nonnegative(),
  archive: z.number().int().nonnegative(),
  other: z.number().int().nonnegative(),
});

export const dashboardOverviewSchema = z.strictObject({
  items_total: z.number().int().nonnegative(),
  locations_total: z.number().int().nonnegative(),
  attachments_total: z.number().int().nonnegative(),
  maintenance_total: z.number().int().nonnegative(),
  suppliers_total: z.number().int().nonnegative(),
  check_in_out_total: z.number().int().nonnegative(),
  categories_total: unsupportedDashboardTotal,
  transfers_total: unsupportedDashboardTotal,
  uom_total: z.number().int().nonnegative(),
  events_total: unsupportedDashboardTotal,
  attachment_counts: attachmentCountsSchema,
});

export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;
