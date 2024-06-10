import { Separator } from "@/components/ui/separator";
import Step from "@/components/ui/step";
import Data from "@/components/ui/data";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_ASSET_MUTATION,
  GET_ASSET_QUERY,
  UPDATE_ASSET_MUTATION,
} from "@/api/graphql/queries/query";
import { VideoDetails } from "@/api/graphql/types/video-details";
import { bytesToMegaBytes, secondsToHHMMSS } from "@/lib/utils";

import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Asset, MutationUpdateAssetArgs } from "@/api/graphql/graphql";

const PlyrHlsPlayer = dynamic(() => import("@/components/ui/video-player"), {
  ssr: false,
});

export default function VideoDetailsPage() {
  const router = useRouter();
  const [updateAsset] = useMutation<Asset>(UPDATE_ASSET_MUTATION);
  const { id } = router.query;
  const [enableEditTitle, setEnableEditTitle] = useState(false);
  const [title, setTitle] = useState("" as string);
  const [tempTitle, setTempTitle] = useState("" as string);

  const { data, loading, error } = useQuery(GET_ASSET_QUERY, {
    variables: {
      id: id,
    },
    onCompleted: (data) => {
      setTitle(data.GetAsset.title);
      setTempTitle(data.GetAsset.title);
    },
  });
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error...</div>;

  let videoDetails: VideoDetails = data.GetAsset;
  const masterPlaylistUrl = videoDetails.master_playlist_url;

  const onTitleClick = async () => {
    setTempTitle(title);
    setTitle(title);
    setEnableEditTitle(true);
  };

  const onUpdateClick = async () => {
    let res = await updateAsset({
      variables: {
        id,
        title: tempTitle,
      },
    });
    setTitle(tempTitle);

    setEnableEditTitle(false);
  };
  const onCancelClick = () => {
    setEnableEditTitle(false);
  };

  const onKeyDownInTitle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("key down in title");
    if (e.key === "Enter") {
      onUpdateClick();
    }
  };
  return (
    <div className={"flex space-x-4"}>
      <div className={"flex flex-col space-y-4 p-8 border-2 rounded w-6/12"}>
        {enableEditTitle ? (
          <div className="flex gap-2">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => onKeyDownInTitle(e)}
            ></Input>
            <Button
              variant="outline"
              size="icon"
              className="bg-blue-500 text-white"
              onClick={onUpdateClick}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-red-500 text-white"
              onClick={onCancelClick}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-2xl hover:cursor-pointer" onClick={onTitleClick}>
              {title}
            </p>
          </div>
        )}

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
            label={"Duration"}
            value={secondsToHHMMSS(videoDetails.duration)}
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
