import VideoPlayer from "@/components/ui/video-player";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import Step from "@/components/ui/step";
import Data from "@/components/ui/data";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { GET_VIDEO_QUERY } from "@/api/graphql/queries/query";
import { VideoDetails } from "@/api/graphql/types/video-details";
import { bytesToMegaBytes } from "@/lib/utils";
import { VIDEO_STATUS } from "@/lib/constant";

export default function VideoDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading, error } = useQuery(GET_VIDEO_QUERY, {
    variables: {
      id: id,
    },
  });
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error...</div>;

  let videoDetails: VideoDetails = data.GetVideo;
  const masterPlaylistUrl =
    videoDetails.latest_status === VIDEO_STATUS.READY
      ? `https://s3.ap-southeast-1.amazonaws.com/cdn.10minuteschool.com/${videoDetails._id}/master.m3u8`
      : null;

  return (
    <div className={"flex space-x-4"}>
      <div className={"flex flex-col space-y-4 p-8 border-2 rounded w-6/12"}>
        <div>
          <p className="text-2xl">{videoDetails.title}</p>
        </div>

        <Separator />
        <div className={"border-2 min-h-[500px]"}>
          {masterPlaylistUrl ? (
            <VideoPlayer source={`${masterPlaylistUrl}`} />
          ) : (
            <div
              className={
                "flex justify-center items-center h-[500px] bg-black text-white"
              }
            >
              Video is not ready yet
            </div>
          )}
        </div>
        <div>
          <div>
            <Data
              label={"Tags"}
              value={
                videoDetails.tags.length > 0
                  ? videoDetails.tags
                  : ("No Tags found" as any)
              }
            />
            <Data
              label={"Description"}
              value={videoDetails.description ?? "No description found"}
            />
          </div>
        </div>
      </div>
      <div className={"border-2 rounded space-y-4 p-8 w-6/12 h-3/6"}>
        <div>
          <Data label={"Current Status"} value={videoDetails.latest_status} />
          <Data
            label={"Created At"}
            value={new Date(videoDetails.created_at).toDateString()}
          />
          <Data
            label={"Resolution"}
            value={`${videoDetails.height} x ${videoDetails.width}`}
          />
          <Data
            label={"Size"}
            value={`${bytesToMegaBytes(videoDetails.size)} MB`}
          />
        </div>
        <div className={"flex flex-col items-center"}>
          <div className={"flex justify-between"}>
            {videoDetails.status_details.map((status, index) => {
              if (index === videoDetails.status_details.length - 1) {
                return (
                  <Step key={index} title={status.status} isFinal={true} />
                );
              }
              return <Step key={index} title={status.status} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
