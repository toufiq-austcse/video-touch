import { VideoDetails } from "@/api/graphql/types/video-details";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_ASSET_MUTATION } from "@/api/graphql/queries/query";

const VideoTitleComponent = ({
  videoDetails,
}: {
  videoDetails: VideoDetails;
}) => {
  const [enableEditTitle, setEnableEditTitle] = useState(false);
  const [title, setTitle] = useState(videoDetails.title);
  const [tempTitle, setTempTitle] = useState(videoDetails.title);

  const [updateAsset] = useMutation<any>(UPDATE_ASSET_MUTATION);

  const onTitleClick = () => {
    setEnableEditTitle(true);
  };

  const onUpdateClick = async () => {
    let res = await updateAsset({
      variables: {
        id: videoDetails._id,
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
    if (e.key === "Enter") {
      onUpdateClick();
    }
  };

  return enableEditTitle ? (
    <div className="flex gap-4">
      <Input
        value={decodeURIComponent(tempTitle)}
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
        {decodeURIComponent(title)}
      </p>
    </div>
  );
};
export default VideoTitleComponent;
