import type { ColumnDef } from "@tanstack/react-table";
import type { EconomyFinvizItem } from "~/lib/API/Source/Calendar";

export const columns: ColumnDef<EconomyFinvizItem>[] = [
  {
    accessorKey: "event",
    header: "Event",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "ticker",
    header: "Ticker",
  },
  {
    accessorKey: "actual",
    header: "Actual",
  },
  {
    accessorKey: "forecast",
    header: "Forecast",
  },
  {
    accessorKey: "previous",
    header: "Previous",
  },
  {
    accessorKey: "importance",
    header: "Importance",
  },
  {
    accessorKey: "alert",
    header: "Alert",
  },
  {
    accessorKey: "reference",
    header: "Reference",
  },
  {
    accessorKey: "referenceDate",
    header: "Reference Date",
  },
];
