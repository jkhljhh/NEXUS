// Filename: table.tsx
// Path: @/app/(dashboard)/foundation/configuration/core-view
"use client";

import * as React from "react";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { VariantProps } from "class-variance-authority";
import { MoreHorizontal, Text } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

import { useDataTable } from "@/hooks/use-data-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEnumOptions } from "@/lib/utils";
import { IconFolderFilled } from "@tabler/icons-react";
// import { Form as DeleteForm } from "./delete/form";
// import { Form as EditForm } from "./edit/form";
// import { type Schema, schema } from "./edit/shared";
import { z } from "zod";
import {schema} from "./shared"

// 1. Define item schema


// 2. Define schema as an array of itemSchema


// 3. Type definitions
export type Item = z.infer<typeof schema >;
export type TableSchema = Item;

// 4. You can now use schema
const tableSchema = schema;
type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

type TableProps = {
  //startRange: { min: number; max: number } | null;
 // endRange: { min: number; max: number } | null;
  data: TableSchema[];
  count: number;
};

export function Table({ data, count }: TableProps) {
  const [name] = useQueryState("name", parseAsString.withDefault(""));
  // const [type] = useQueryState(
  //   "type",
  //   parseAsArrayOf(parseAsString).withDefault([]),
  // );
  // const [start] = useQueryState(
  //   "start",
  //   parseAsArrayOf(parseAsString).withDefault([]),
  // );

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const matchesName =
        name === "" || item.name.toLowerCase().includes(name.toLowerCase());

      // const matchesType = type.length === 0 || type.includes(item.type);

      // const matchesStart =
      //   start.length !== 2 ||
      //   (Number.isFinite(Number(start[0])) &&
      //     Number.isFinite(Number(start[1])) &&
      //     item.start >= Number(start[0]) &&
      //     item.start <= Number(start[1]));

      return matchesName// && matchesType && matchesStart;
    });
  }, [data, name]);

  const columns: ColumnDef<TableSchema>[] = [
    
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Folder Name" />
      ),
      cell: ({ cell }) => {
        const item = cell.getValue<TableSchema["name"]>();
        return <div className="flex items-center gap-2">
            <IconFolderFilled className="w-4 h-4" />
            <span>{item}</span>
            </div> },
      meta: {
        label: "Name",
        placeholder: "Search Folder name...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
     {
      id: "created_at",
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Creation_Time" />
      ),
      cell: ({ cell }) => {
        
        const rawDate = cell.getValue<TableSchema["created_at"]>();
        const formattedDate = rawDate
            ? new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(new Date(rawDate))
            : "-";
            
        return <div>{formattedDate}</div>;
        },
      meta: {
        label: "Date",
        placeholder: "Date",
        variant: "date",
        icon: Text,
      },
      enableColumnFilter: true,
    },
   
      {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <EditForm data={row.original} />
              <DeleteForm id={row.original.id} /> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 32,
    },
  ];

  const { table } = useDataTable({
    data: filteredData,
    columns,
    pageCount: count,
    initialState: {
      sorting: [{ id: "created_at", desc: false }],
      columnPinning: { right: ["actions"] },
    },
    shallow: false,
    getRowId: (row) => String(row.name),
  });

  return (
    <div className="data-table-container">
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
