"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { badgeVariants } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import AppTable from "@/components/ui/app-table";
import { useQuery } from "@apollo/client";
import { LIST_VIDEO_QUERY } from "@/api/graphql/queries/query";

const data: Video[] = [
  {
    id: "m5gr84i9",
    title: "video 1",
    status: "success",
    createdAt: new Date(),
  },
  {
    id: "3u1reuv4",
    title: "video 1",
    status: "success",
    createdAt: new Date(),
  },
  {
    id: "derv1ws0",
    title: "video 1",
    status: "processing",
    createdAt: new Date(),
  },
  {
    id: "5kma53ae",
    title: "video 1",
    status: "success",
    createdAt: new Date(),
  },
  {
    id: "bhqecj4p",
    title: "video 1",
    status: "failed",
    createdAt: new Date(),
  },
];

export type Video = {
  id: string;
  title: string;
  status: "pending" | "processing" | "success" | "failed";
  createdAt: Date;
};

export const columns: ColumnDef<Video>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <Link className="flex" href="/videos/dsfsd">
          <Image
            src="/next.svg"
            alt="Next.js Logo"
            width={100}
            height={100}
            priority
          />
          <div className="lowercase font-medium">{row.getValue("title")}</div>
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      let status = row.getValue("status");
      if (status === "failed") {
        return (
          <div
            className={`${badgeVariants({ variant: "destructive" })} capitalize`}
          >
            {row.getValue("status")}
          </div>
        );
      } else if (status === "processing") {
        return (
          <div
            className={`${badgeVariants({ variant: "default" })} capitalize`}
          >
            {row.getValue("status")}
          </div>
        );
      }

      return (
        <div
          className={`${badgeVariants({ variant: "secondary" })} capitalize`}
        >
          {row.getValue("status")}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "CreatedAt",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt")).toDateString();

      return <div>{date}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function HomePage() {
  const { data, loading, error } = useQuery(LIST_VIDEO_QUERY);
  if (loading) {
    return <h2>Loading...</h2>;
  }
  if (error) {
    return <h2>Error: {error.message}</h2>;
  }
  console.log("data", data);
  return <AppTable<Video> data={data} columns={columns} />;
}
