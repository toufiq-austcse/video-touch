"use client";

import * as React from "react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Plus,
  Trash2,
  Edit,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppTable from "@/components/ui/app-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@apollo/client";
import {
  LIST_WEBHOOKS,
  CREATE_WEBHOOK_MUTATION,
  UPDATE_WEBHOOK_MUTATION,
  DELETE_WEBHOOK_MUTATION,
} from "@/api/graphql/queries/query";
import { NextPage } from "next";
import PrivateRoute from "@/components/private-route";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type Webhook = {
  _id: string;
  url: string;
  secret_token: string;
  created_at: Date;
  updated_at: Date;
};

// Validation schema
const webhookSchema = z.object({
  url: z
    .string()
    .min(1, "Webhook URL is required")
    .url("Please enter a valid URL")
    .refine(
      (url: string) => url.startsWith("http://") || url.startsWith("https://"),
      {
        message: "URL must use HTTP or HTTPS protocol",
      }
    ),
  secret_token: z.string().optional(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

const DeveloperPage: NextPage = () => {
  const pageSize = 10;
  const [pageIndex, setPageIndex] = React.useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Create form
  const createForm = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      url: "",
      secret_token: "",
    },
  });

  // Edit form
  const editForm = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      url: "",
      secret_token: "",
    },
  });

  const { data, loading, error, refetch, fetchMore } = useQuery(LIST_WEBHOOKS, {
    variables: {
      first: pageSize,
      search: searchTerm,
    },
    fetchPolicy: "network-only",
  });


  const [createWebhook, { loading: createLoading }] = useMutation(
    CREATE_WEBHOOK_MUTATION,
    {
      onCompleted: () => {
        refetch();
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
      onError: (error) => {
        console.error("Error creating webhook:", error);
        alert("Failed to create webhook: " + error.message);
      },
    },
  );

  const [updateWebhook, { loading: updateLoading }] = useMutation(
    UPDATE_WEBHOOK_MUTATION,
    {
      onCompleted: () => {
        refetch();
        setIsEditDialogOpen(false);
        setSelectedWebhook(null);
        editForm.reset();
      },
      onError: (error) => {
        console.error("Error updating webhook:", error);
        alert("Failed to update webhook: " + error.message);
      },
    },
  );

  const [deleteWebhook, { loading: deleteLoading }] = useMutation(
    DELETE_WEBHOOK_MUTATION,
    {
      onCompleted: () => {
        refetch();
        setIsDeleteDialogOpen(false);
        setSelectedWebhook(null);
      },
      onError: (error) => {
        console.error("Error deleting webhook:", error);
        alert("Failed to delete webhook: " + error.message);
      },
    },
  );

  const handleCreate = createForm.handleSubmit((data: WebhookFormData) => {
    createWebhook({
      variables: {
        url: data.url,
        secret_token: data.secret_token || null,
      },
    });
  });

  const handleUpdate = editForm.handleSubmit((data: WebhookFormData) => {
    if (!selectedWebhook) return;
    updateWebhook({
      variables: {
        id: selectedWebhook._id,
        url: data.url || null,
        secret_token: data.secret_token || null,
      },
    });
  });

  const handleDelete = () => {
    if (!selectedWebhook) return;
    deleteWebhook({
      variables: {
        id: selectedWebhook._id,
      },
    });
  };

  const handleEdit = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    editForm.reset({
      url: webhook.url,
      secret_token: webhook.secret_token || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsDeleteDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const nextFunction = () => {
    if (data?.ListWebhook?.page_info?.next_cursor) {
      fetchMore({
        variables: {
          first: pageSize,
          after: data.ListWebhook.page_info.next_cursor,
          search: searchTerm || undefined,
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
    if (data?.ListWebhook?.page_info?.prev_cursor) {
      fetchMore({
        variables: {
          first: pageSize,
          before: data.ListWebhook.page_info.prev_cursor,
          search: searchTerm || undefined,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          setPageIndex((prev) => prev - 1);
          if (!fetchMoreResult) {
            return prev;
          }
          return fetchMoreResult;
        },
      });
    }
  };

  const onSearchEnter = (searchValue: string) => {
    setSearchTerm(searchValue);
    setPageIndex(0);
    refetch({ first: pageSize, after: null, search: searchValue || undefined });
  };

  const columns: ColumnDef<Webhook>[] = [
    {
      accessorKey: "url",
      header: "Webhook URL",
      cell: ({ row }) => {
        const url = row.getValue("url") as string;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{url}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(url)}
            >
              {copiedToken === url ? (
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "secret_token",
      header: "Secret Token",
      cell: ({ row }) => {
        const token = row.getValue("secret_token") as string;
        return token ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">
              {token.substring(0, 20)}...
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(token)}
            >
              {copiedToken === token ? (
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <span className="text-gray-400">No token</span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const webhook = row.original;
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
              <DropdownMenuItem onClick={() => handleEdit(webhook)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(webhook)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const webhooks = data?.ListWebhook?.webhooks || [];

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className=" text-2xl font-bold">Developer Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage webhooks and API integrations for your application
          </p>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="flex items-center justify-center">
              <p className="text-gray-500">Loading webhooks...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className=" text-2xl font-bold">Developer Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage webhooks and API integrations for your application
          </p>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-red-600">Error loading webhooks</p>
              <p className="text-sm text-gray-500">{error.message}</p>
              <Button
                onClick={() => refetch()}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className=" text-2xl font-bold">Developer Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage webhooks and API integrations for your application
        </p>
      </div>

      {/* Webhooks Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Manage your webhook endpoints</CardDescription>
            </div>
            <Button
              onClick={() => {
                createForm.reset();
                setIsCreateDialogOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AppTable
            columns={columns}
            data={webhooks}
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalPageCount={data?.ListWebhook?.page_info?.total_pages || 0}
            next={nextFunction}
            prev={prevFunction}
            onSearchEnter={onSearchEnter}
            showSearch={false}
          />
        </CardContent>
      </Card>

      {/* Create Webhook Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            createForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
            <DialogDescription>
              Add a new webhook endpoint to receive event notifications
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">Webhook URL *</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/webhook"
                  {...createForm.register("url")}
                  className={createForm.formState.errors.url ? "border-red-500" : ""}
                />
                {createForm.formState.errors.url && (
                  <p className="text-xs text-red-600 mt-1">
                    {createForm.formState.errors.url.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="secret_token">Secret Token (Optional)</Label>
                <Input
                  id="secret_token"
                  placeholder="Enter a secret token for verification"
                  {...createForm.register("secret_token")}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This token will be sent in the request headers as{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    x-vdio-touch-key
                  </code>
                </p>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {createLoading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            editForm.reset();
            setSelectedWebhook(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Webhook</DialogTitle>
            <DialogDescription>
              Update your webhook endpoint configuration
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-url">Webhook URL</Label>
                <Input
                  id="edit-url"
                  placeholder="https://example.com/webhook"
                  {...editForm.register("url")}
                  className={editForm.formState.errors.url ? "border-red-500" : ""}
                />
                {editForm.formState.errors.url && (
                  <p className="text-xs text-red-600 mt-1">
                    {editForm.formState.errors.url.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-secret_token">Secret Token</Label>
                <Input
                  id="edit-secret_token"
                  placeholder="Enter a secret token for verification"
                  {...editForm.register("secret_token")}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {updateLoading ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this webhook? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedWebhook && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-mono">{selectedWebhook.url}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
          <CardDescription>
            Configure webhook endpoints to receive real-time notifications about
            asset and file events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Asset Events:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside mb-3">
              <li>
                <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  asset.status.pending
                </code>{" "}
                - Asset processing started
              </li>
              <li>
                <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  asset.status.processing
                </code>{" "}
                - Asset is being processed
              </li>
              <li>
                <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  asset.status.ready
                </code>{" "}
                - Asset processing completed
              </li>
              <li>
                <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  asset.status.failed
                </code>{" "}
                - Asset processing failed
              </li>
            </ul>
            <h4 className="font-semibold text-sm mb-2 mt-4">File Events:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>
                <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  file.status.pending
                </code>{" "}
                - File processing started
              </li>
              <li>
                <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  file.status.processing
                </code>{" "}
                - File is being processed
              </li>
              <li>
                <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  file.status.ready
                </code>{" "}
                - File processing completed (includes file_url)
              </li>
              <li>
                <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                  file.status.failed
                </code>{" "}
                - File processing failed
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Asset Event Payload:</h4>
            <pre className="bg-gray-50 border border-gray-200 p-3 rounded text-xs overflow-x-auto mb-4">
              {`{
  "event_type": "asset.status.ready",
  "data": {
    "asset_id": "692b5a0f839ee56ff26d9127",
    "status": "READY",
    "created_at": "2025-11-29T20:42:20.587Z",
    "updated_at": "2025-11-29T20:42:21.271Z"
  }
}`}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">File Event Payload:</h4>
            <pre className="bg-gray-50 border border-gray-200 p-3 rounded text-xs overflow-x-auto">
              {`{
  "event_type": "file.status.ready",
  "data": {
    "file_id": "692b5aac839ee5864e6d9169",
    "asset_id": "692b5a0f839ee56ff26d9127",
    "name": "transcript.json",
    "status": "READY",
    "created_at": "2025-11-29T20:42:20.587Z",
    "updated_at": "2025-11-29T20:42:21.271Z",
    "size": 0,
    "type": "transcript",
    "file_url": "https://10ms-gumlet-videos.s3.ap-southeast-1.amazonaws.com/videos/..."
  }
}`}
            </pre>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Request Headers:</h4>
            <p className="text-sm text-gray-600 mb-2">
              Your webhook endpoint will receive the following headers:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                •{" "}
                <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">
                  x-vdio-touch-key
                </code>
                : Service authentication key
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              Note: Partial transcript files do not trigger webhook events
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateRoute({ Component: DeveloperPage });
