import Data from "@/components/ui/data";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { GET_ASSET_QUERY } from "@/api/graphql/queries/query";
import { VideoDetails } from "@/api/graphql/types/video-details";
import { bytesToMegaBytes, secondsToHHMMSS } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import dynamic from "next/dynamic";
import VideoTitleComponent from "@/components/ui/video-title-component";
import VideoFilesComponent from "@/components/ui/video-files-component";
import { NextPage } from "next";
import PrivateRoute from "@/components/private-route";
import crypto from "crypto";
import React, { useEffect, useState } from "react";

const PlyrHlsPlayer = dynamic(() => import("@/components/ui/video-player"), {
  ssr: false,
});

const VideoDetailsComponent = dynamic(
  () => import("@/components/ui/video-details-component"),
  {
    ssr: false,
  },
);

const VideoDetailsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading, error } = useQuery(GET_ASSET_QUERY, {
    variables: {
      id: id,
    },
    fetchPolicy: "network-only", // Force network request on each page load, don't use cache
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading video details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load video details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  let videoDetails: VideoDetails = data.GetAsset;
  const masterPlaylistUrl = videoDetails.master_playlist_url;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Video player and details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <VideoTitleComponent videoDetails={videoDetails} />
            </CardHeader>
            <CardContent>
              <div className="mt-4 rounded-lg overflow-hidden shadow-md">
                {masterPlaylistUrl ? (
                  <PlyrHlsPlayer
                    source={masterPlaylistUrl}
                    thumbnailUrl={videoDetails.thumbnail_url}
                  />
                ) : (
                  <div className="flex justify-center items-center h-[400px] bg-black text-white">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-lg">Video is not ready yet</p>
                      <Badge className="mt-2 text-white" variant="outline">
                        {videoDetails.latest_status}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoDetailsComponent videoDetails={videoDetails} />
            </CardContent>
          </Card>

          <VideoFilesComponent videoDetails={videoDetails} />
        </div>

        {/* Sidebar - Metadata and Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <Badge className="mb-2" variant="secondary">
                  {videoDetails.latest_status}
                </Badge>
                <Data
                  label={"Created At"}
                  value={new Date(videoDetails.created_at).toLocaleString()}
                />
                <Data
                  label={"Resolution"}
                  value={`${videoDetails.height} x ${videoDetails.width}`}
                />
                <Data
                  label={"Duration"}
                  value={secondsToHHMMSS(videoDetails.duration)}
                />
                <Data
                  label={"Size"}
                  value={`${bytesToMegaBytes(videoDetails.size)} MB`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processing Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...videoDetails.status_logs]
                  .reverse()
                  .map((status, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 pb-4 border-b last:border-0"
                    >
                      <div
                        className={`bg-primary/10 p-2 rounded-full ${index === 0 && status.status !== "READY" ? "blink" : ""}`}
                      >
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <div>
                        <p className="font-medium">{status.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(status.created_at).toLocaleString()}
                        </p>
                        {status.details && (
                          <p className="text-sm mt-1">{status.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivateRoute({ Component: VideoDetailsPage });
