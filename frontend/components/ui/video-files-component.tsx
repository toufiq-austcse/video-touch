import React from "react";
import { VideoDetails, FileDetails } from "@/api/graphql/types/video-details";
import { bytesToMegaBytes } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface VideoFilesComponentProps {
  videoDetails: VideoDetails;
}

const VideoFilesComponent: React.FC<VideoFilesComponentProps> = ({
  videoDetails,
}) => {
  // Filter files to only include playlist files (not thumbnails)
  const videoFiles =
    videoDetails.files?.filter((file) => file.type === "playlist") || [];

  // Sort video files by resolution in ascending order (360p first, 720p last)
  const sortedFiles = [...videoFiles].sort((a, b) => a.height - b.height);

  // Calculate total size of all video files
  const totalSize = sortedFiles.reduce((sum, file) => sum + file.size, 0);

  // Filter files to only include source files
  const sourceFile: FileDetails | null =
    videoDetails.files?.find((file) => file.type === "source") || null;

  // Create a thumbnail file object if thumbnail_url exists
  const thumbnailFile: FileDetails | null =
    videoDetails.files.find((file) => file.type === "thumbnail") || null;
    
  // Calculate total size of other files (thumbnail and source)
  const otherFilesSize = (thumbnailFile ? thumbnailFile.size : 0) + (sourceFile ? sourceFile.size : 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Video Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Video Files Section */}
            <div>
              <div className="space-y-4">
                {sortedFiles.length > 0 ? (
                  <>
                    {sortedFiles.map((file) => (
                      <div
                        key={file._id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-medium">
                            {file.height}X{file.width}
                          </div>
                          <Badge
                            variant={
                              file.latest_status === "READY"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {file.latest_status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {bytesToMegaBytes(file.size)} MB
                        </div>
                      </div>
                    ))}

                    {/* Total size section */}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center p-3">
                      <div className="font-semibold">Total Size</div>
                      <div className="text-sm font-medium">
                        {bytesToMegaBytes(totalSize)} MB
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No video files information available
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Others</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Thumbnail File Section */}
              {thumbnailFile && (
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-medium">Thumbnail</div>
                    <Badge
                      variant={
                        thumbnailFile.latest_status === "READY"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {thumbnailFile.latest_status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {bytesToMegaBytes(thumbnailFile.size)} MB
                  </div>
                </div>
              )}

              {/* Source File Section */}
              {sourceFile && (
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-medium">Source</div>
                    <Badge
                      variant={
                        sourceFile.latest_status === "READY"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {sourceFile.latest_status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {bytesToMegaBytes(sourceFile.size)} MB
                  </div>
                </div>
              )}

              {!thumbnailFile && !sourceFile && (
                <div className="text-center py-4 text-muted-foreground">
                  No other files available
                </div>
              )}
              
              {/* Total size section for Others */}
              {(thumbnailFile || sourceFile) && (
                <>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center p-3">
                    <div className="font-semibold">Total Size</div>
                    <div className="text-sm font-medium">
                      {bytesToMegaBytes(otherFilesSize)} MB
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default VideoFilesComponent;
