import PlyrHlsPlayer from "@/components/ui/video-player";
import { Separator } from "@/components/ui/separator";
import Step from "@/components/ui/step";
import Data from "@/components/ui/data";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { GET_ASSET_QUERY } from "@/api/graphql/queries/query";
import { VideoDetails } from "@/api/graphql/types/video-details";
import { bytesToMegaBytes } from "@/lib/utils";

export default function VideoDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading, error } = useQuery(GET_ASSET_QUERY, {
    variables: {
      id: id,
    },
  });
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error...</div>;

  let videoDetails: VideoDetails = data.GetAsset;
  const masterPlaylistUrl = videoDetails.master_playlist_url;

  return (
    <div className={"flex space-x-4"}>
      <div className={"flex flex-col space-y-4 p-8 border-2 rounded w-6/12"}>
        <div>
          <p className="text-2xl">{videoDetails.title}</p>
        </div>

        <Separator />
        <div className={"border-2 min-h-[300px]"}>
          {masterPlaylistUrl ? (
            <PlyrHlsPlayer source={masterPlaylistUrl} />
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
        <div className={"flex flex-col overflow-auto"}>
          <div className={"flex flex-start"}>
            {[...videoDetails.status_logs].map((status, index) => {
              if (index === videoDetails.status_logs.length - 1) {
                return (
                  <Step
                    key={index}
                    title={status.status}
                    createdAt={status.created_at}
                    isFinal={true}
                  />
                );
              }
              return (
                <Step
                  key={index}
                  title={status.status}
                  createdAt={status.created_at}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
