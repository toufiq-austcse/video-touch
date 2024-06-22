"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { badgeVariants } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import AppTable from "@/components/ui/app-table";
import { useQuery } from "@apollo/client";
import { LIST_ASSETS } from "@/api/graphql/queries/query";
import UploadNew from "@/components/ui/upload-new";
import { VIDEO_STATUS } from "@/lib/constant";
import { secondsToHHMMSS } from "@/lib/utils";
import Navbar from '@/components/ui/navbar';

export type Video = {
  _id: string;
  title: string;
  thumbnail_url: string;
  status: "pending" | "processing" | "success" | "failed";
  created_at: Date;
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
        <Link className="flex space-x-4" href={`/videos/${row.original._id}`}>
          <Image
            src={row.original.thumbnail_url}
            alt="default thumbnail"
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
      if (status === VIDEO_STATUS.FAILED) {
        return (
          <div
            className={`${badgeVariants({ variant: "destructive" })} capitalize`}
          >
            {row.getValue("status")}
          </div>
        );
      } else if (status === VIDEO_STATUS.PROCESSING) {
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
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      return <div>{secondsToHHMMSS(row.getValue("duration"))}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: "CreatedAt",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at")).toDateString();

      return <div>{date}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const video = row.original;

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
              onClick={() => navigator.clipboard.writeText(video._id)}
            >
              Copy Video ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function HomePage() {
  let pageSize = Number(process.env.NEXT_PUBLIC_VIDEO_LIST_PAGE_SIZE) || 4;
  let [pageIndex, setPageIndex] = React.useState(0);

  let { data, loading, error, fetchMore, refetch } = useQuery(LIST_ASSETS, {
    variables: {
      first: pageSize,
      after: null,
    },
  });

  console.log("data ", data);

  const nextFunction = () => {
    console.log("next");
    fetchMore({
      variables: {
        first: pageSize,
        after: data.ListAsset.page_info.next_cursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        setPageIndex((prev) => prev + 1);
        if (!fetchMoreResult) {
          return prev;
        }
        return fetchMoreResult;
      },
    });
  };

  const prevFunction = () => {
    console.log("prev");
    fetchMore({
      variables: {
        first: pageSize,
        before: data.ListAsset.page_info.prev_cursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        setPageIndex((prev) => prev - 1);
        if (!fetchMoreResult) {
          return prev;
        }
        return fetchMoreResult;
      },
    });
  };

  return (
    <div>
      <div className="flex">
        <UploadNew refetch={refetch} />
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!loading && !error && (
        <AppTable<Video>
          totalPageCount={data.ListAsset.page_info.total_pages}
          data={data.ListAsset.assets}
          columns={columns}
          pageIndex={pageIndex}
          pageSize={pageSize}
          next={nextFunction}
          prev={prevFunction}
        />
      )}
    </div>
  );
}
