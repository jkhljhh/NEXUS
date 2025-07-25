import { DataTableSkeleton } from "./data-table-skeleton";

export function TableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={7}
      filterCount={2}
      cellWidths={["10rem", "30rem", "10rem", "10rem", "6rem", "6rem", "6rem"]}
      shrinkZero
    />
  );
}
