import React from "react";
import { VideoDetails, FileDetails } from "@/api/graphql/types/video-details";
import { bytesToMegaBytes } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLazyQuery } from "@apollo/client";
import { GET_FILE_URL } from "@/api/graphql/queries/query";

interface VideoFilesComponentProps {
  videoDetails: VideoDetails;
}

const VideoFilesComponent: React.FC<VideoFilesComponentProps> = ({
  videoDetails,
}) => {
  // Lazy query for getting file URL
  const [getFileUrl, { loading: downloadLoading }] = useLazyQuery(GET_FILE_URL);

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
  const downloadFile: FileDetails | null =
    videoDetails.files.find((file) => file.type === "download") || null;

  // Calculate total size of other files (thumbnail and source)
  const otherFilesSize =
    (thumbnailFile ? thumbnailFile.size : 0) +
    (sourceFile ? sourceFile.size : 0);

  const onDownloadButtonClick = async (file: FileDetails) => {
    try {
      // Call the GraphQL query to get file URL
      const { data } = await getFileUrl({
        variables: { id: file._id },
      });

      if (data?.GetFileUrl) {
        window.open(data.GetFileUrl, "_blank");
      } else {
        alert("No file URL received from query");
      }
    } catch (error) {
      console.log("error ", error);
      alert("Error getting file URL:");
    }
  };

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
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-muted-foreground">
                      {bytesToMegaBytes(thumbnailFile.size)} MB
                    </div>
                    {thumbnailFile.latest_status === "READY" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadButtonClick(thumbnailFile)}
                        disabled={downloadLoading}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download thumbnail</span>
                      </Button>
                    )}
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
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-muted-foreground">
                      {bytesToMegaBytes(sourceFile.size)} MB
                    </div>
                    {sourceFile.latest_status === "READY" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadButtonClick(sourceFile)}
                        disabled={downloadLoading}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download source file</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Download File Section */}
              {downloadFile && (
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-medium">Download</div>
                    <Badge
                      variant={
                        downloadFile.latest_status === "READY"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {downloadFile.latest_status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-muted-foreground">
                      {bytesToMegaBytes(downloadFile.size)} MB
                    </div>
                    {downloadFile.latest_status === "READY" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadButtonClick(downloadFile)}
                        disabled={downloadLoading}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download file</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {!thumbnailFile && !sourceFile && !downloadFile && (
                <div className="text-center py-4 text-muted-foreground">
                  No other files available
                </div>
              )}

              {/* Total size section for Others */}
              {(thumbnailFile || sourceFile || downloadFile) && (
                <>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center p-3">
                    <div className="font-semibold">Total Size</div>
                    <div className="text-sm font-medium">
                      {bytesToMegaBytes(otherFilesSize)}
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
