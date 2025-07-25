"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { IconX } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatCurrencyCompact } from "@/lib/utils";

type TableColumn = {
  key: string;
  label: string;
  dataType: string;
  unit?: string;
};
type data = {
  columns: TableColumn[];
  rows: Record<string, any>[];
  SUM_TOTAL?: Record<string, number>;
};
interface DataTableProps {
  data: data;
}

function downloadCSV(
  columns: TableColumn[],
  rows: Record<string, any>[],
  filename = "data.csv",
) {
  const header = columns
    .map((c) => `"${c.label.replace(/"/g, '""')}"`)
    .join(",");
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          let value = row[col.key];
          if (value === undefined || value === null) value = "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\r\n");
  const csv = [header, body].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DataTable({ data }: DataTableProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const alignmentMap = React.useMemo(() => {
    const map: Record<string, "right" | "left"> = {};
    data.columns.forEach((col) => {
      map[col.key] =
        col.dataType === "integer" ||
        col.dataType === "currency" ||
        col.dataType === "percentage" ||
        col.dataType === "number"
          ? "right"
          : "left";
    });
    return map;
  }, [data.columns]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "__index",
      header: "#",
      cell: ({ row }: { row: any }) => <div>{row.index + 1}</div>,
      enableSorting: false,
      enableGlobalFilter: false,
    },
    ...data.columns.map((col) => {
      const labelWithUnit =
        (col.dataType === "currency" || col.dataType === "percentage") &&
        col.unit
          ? `${col.label} (${col.unit})`
          : col.label;
      return {
        accessorKey: col.key,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={cn(
              alignmentMap[col.key] === "right" ? "-mr-3 justify-end" : "-ml-3",
              "px-0 hover:bg-transparent",
            )}
          >
            {labelWithUnit}
            {column.getCanSort() &&
              (column.getIsSorted() === "desc" ? (
                <ChevronDown />
              ) : column.getIsSorted() === "asc" ? (
                <ChevronUp />
              ) : (
                <ChevronsUpDown />
              ))}
          </Button>
        ),
        cell: ({ row }: { row: any }) => {
          const value = row.getValue(col.key) as string | number | null;
          const isNumeric =
            typeof value === "number" &&
            (col.dataType === "integer" ||
              col.dataType === "currency" ||
              col.dataType === "percentage" ||
              col.dataType === "number");

          let formatted: string | number = value ?? "";

          if (col.dataType === "currency" && typeof value === "number") {
            formatted = formatCurrencyCompact(value);
          } else if (isNumeric) {
            formatted = value.toFixed(2);
          }

          const colorClass =
            col.dataType === "percentage" && typeof value === "number"
              ? value >= 0
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
              : "";

          return <div className={colorClass}>{formatted}</div>;
        },
        enableSorting: true,
        enableGlobalFilter: true,
      };
    }),
  ];

  const table = useReactTable({
    data: data.rows,
    columns,
    enableGlobalFilter: true,
    getColumnCanGlobalFilter: () => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      pagination,
    },
  });

  const visibleColumns: TableColumn[] = table
    .getVisibleLeafColumns()
    .filter((col) => col.id !== "__index")
    .map((col) => {
      const def = data.columns.find((c) => c.key === col.id);
      if (!def) {
        return {
          key: col.id,
          label: col.id,
          dataType: "string",
        };
      }
      return {
        key: def.key,
        label: def.label,
        dataType: def.dataType,
        unit: def.unit,
      };
    });

  const filteredRows = table.getFilteredRowModel().rows.map((row) =>
    row.getVisibleCells().reduce(
      (acc, cell) => {
        acc[cell.column.id] = cell.getValue();
        return acc;
      },
      {} as Record<string, any>,
    ),
  );

  const pageCount = table.getPageCount();
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const filtersActive =
    globalFilter !== "" ||
    sorting.length > 0 ||
    Object.values(columnVisibility).some((v) => v === false);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="h-8 w-40 lg:w-56"
        />
        {filtersActive && (
          <Button
            variant="outline"
            className="h-8"
            onClick={() => {
              setGlobalFilter("");
              setSorting([]);
              setColumnVisibility({});
            }}
          >
            <IconX className="w-4 h-4" /> Reset
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => {
                const def = data.columns.find((c) => c.key === col.id);
                const label = col.id === "__index" ? "#" : def?.label || col.id;
                return (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="h-8"
          onClick={() => downloadCSV(visibleColumns, filteredRows)}
        >
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      alignmentMap[header.column.id] === "right"
                        ? "text-right"
                        : ""
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        alignmentMap[cell.column.id] === "right"
                          ? "text-right"
                          : ""
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center h-24"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {data.SUM_TOTAL && Object.keys(data.SUM_TOTAL).length > 0 && (
            <TableFooter>
              <TableRow>
                {table.getVisibleLeafColumns().map((col, idx) => (
                  <TableCell
                    key={col.id}
                    className={
                      alignmentMap[col.id] === "right"
                        ? "text-right font-semibold"
                        : "font-semibold"
                    }
                  >
                    {(() => {
                      if (idx === 0) return "Total";
                      const value = data.SUM_TOTAL?.[col.id];
                      const colDef = data.columns.find((c) => c.key === col.id);
                      if (
                        typeof value === "number" &&
                        colDef?.dataType === "currency"
                      ) {
                        return formatCurrencyCompact(value);
                      }
                      return typeof value === "number" ? value.toFixed(2) : "";
                    })()}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-2 text-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => table.setPageIndex(0)}
            disabled={!canPreviousPage}
          >
            <ChevronLeft className="size-3" />
            <ChevronLeft className="size-3 -ml-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => table.previousPage()}
            disabled={!canPreviousPage}
          >
            <ChevronLeft className="size-3" />
          </Button>
          <span className="px-2">
            Page <strong>{pageIndex + 1}</strong> of{" "}
            <strong>{pageCount}</strong>
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => table.nextPage()}
            disabled={!canNextPage}
          >
            <ChevronRight className="size-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!canNextPage}
          >
            <ChevronRight className="size-3" />
            <ChevronRight className="size-3 -ml-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
              table.setPageIndex(0);
            }}
            className="border rounded h-7 px-2"
          >
            {[20, 50, 100, 150].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
