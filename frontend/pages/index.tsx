"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

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
import { useMutation, useQuery } from "@apollo/client";
import {
  LIST_ASSETS,
  RECREATE_ASSET_MUTATION,
} from "@/api/graphql/queries/query";
import { VIDEO_STATUS } from "@/lib/constant";
import { secondsToHHMMSS } from "@/lib/utils";
import { NextPage } from "next";
import PrivateRoute from "@/components/private-route";
import dynamic from "next/dynamic";

const UploadNew = dynamic(() => import("@/components/ui/upload-new"), {
  ssr: false,
});

export type Video = {
  _id: string;
  title: string;
  thumbnail_url: string;
  latest_status: "pending" | "processing" | "success" | "failed";
  duration: number; // Added missing duration property
  created_at: Date;
};

export const createColumns = (refetch: () => void): ColumnDef<Video>[] => [
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
            style={{
              height: "60px",
              width: "100px",
            }}
          />
          <div
            className="lowercase font-medium w-48 truncate"
            title={decodeURIComponent(row.getValue("title"))}
          >
            {decodeURIComponent(row.getValue("title"))}
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "latest_status",
    header: "Status",
    cell: ({ row }) => {
      let status: string = row.getValue("latest_status");
      if (status === VIDEO_STATUS.FAILED) {
        return (
          <div
            className={`${badgeVariants({ variant: "destructive" })} capitalize`}
          >
            {status}
          </div>
        );
      } else if (status === VIDEO_STATUS.PROCESSING) {
        return (
          <div
            className={`${badgeVariants({ variant: "default" })} capitalize`}
          >
            {status}
          </div>
        );
      }

      return (
        <div
          className={`${badgeVariants({ variant: "secondary" })} capitalize`}
        >
          {status}
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

      // Move the mutation hook outside and use it properly
      const ActionsCell = () => {
        const [recreateAsset] = useMutation(RECREATE_ASSET_MUTATION);

        const onReProcessClick = async (id: string) => {
          if (confirm("Are you sure you want to re-process this video?")) {
            try {
              await recreateAsset({
                variables: { id }, // Add proper variables
              });
              // Refetch data to update the list
              refetch();
            } catch (error) {
              alert("Error re-processing video: ");
              console.error("Error re-processing video:", error);
            }
          }
        };

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
              <DropdownMenuItem onClick={() => onReProcessClick(video._id)}>
                Re-process As New
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      };

      return <ActionsCell />;
    },
  },
];

const HomePage: NextPage = () => {
  const pageSize = Number(process.env.NEXT_PUBLIC_VIDEO_LIST_PAGE_SIZE) || 4;
  const [pageIndex, setPageIndex] = React.useState(0);

  const { data, loading, error, fetchMore, refetch } = useQuery(LIST_ASSETS, {
    variables: {
      first: pageSize,
      after: null,
    },
    fetchPolicy: "network-only",
  });

  console.log("data ", data);

  const nextFunction = () => {
    console.log("next");
    if (data?.ListAsset?.page_info?.next_cursor) {
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
    }
  };

  const prevFunction = () => {
    console.log("prev");
    if (data?.ListAsset?.page_info?.prev_cursor) {
      fetchMore({
        variables: {
          first: pageSize,
          before: data.ListAsset.page_info.prev_cursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          setPageIndex((prev) => prev - 1);
          if (!setPageIndex) {
            return prev;
          }
          return fetchMoreResult;
        },
      });
    }
  };

  return (
    <div>
      <div className="flex">
        <UploadNew refetch={refetch} />
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!loading && !error && data?.ListAsset?.assets && (
        <AppTable<Video>
          totalPageCount={data.ListAsset.page_info.total_pages}
          data={data.ListAsset.assets}
          columns={createColumns(refetch)}
          pageIndex={pageIndex}
          pageSize={pageSize}
          next={nextFunction}
          prev={prevFunction}
        />
      )}
    </div>
  );
};

export default PrivateRoute({ Component: HomePage });
