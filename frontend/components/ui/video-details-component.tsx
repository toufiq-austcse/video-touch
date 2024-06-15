import Data from "@/components/ui/data";
import React, { useState } from "react";
import { VideoDetails } from "@/api/graphql/types/video-details";
import { string, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useMutation } from "@apollo/client";
import { Asset } from "@/api/graphql/graphql";
import { UPDATE_ASSET_MUTATION } from "@/api/graphql/queries/query";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  description: z.string().optional(),
  tags: z.string().array().optional(),
});

const VideoDetailsComponent = ({
  videoDetails,
}: {
  videoDetails: VideoDetails;
}) => {
  const [enableEditDetails, setEnableEditDetails] = useState(false);
  const [tags, setTags] = useState<string[]>(videoDetails.tags);
  const [description, setDescription] = useState<string>(
    videoDetails.description,
  );
  const [updateAsset] = useMutation<Asset>(UPDATE_ASSET_MUTATION);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: description,
      tags: tags,
    },
  });

  const onDetailsClick = async () => {
    setEnableEditDetails(true);
  };

  const onSaveChangeButtonClick = async () => {
    // console.log('onSaveChangeButtonClick');
    //
    // let res = await updateAsset({
    //   variables: {
    //     id: videoDetails._id,
    //     description: description,
    //     tags: tags
    //   }
    // });
    // videoDetails.tags = res.data?.tags as any;
    // videoDetails.description = res.data?.description as any;
    setEnableEditDetails(() => false);
    // onSubmit(values.link, values.title as string, values.description as string);
    // form.reset();
  };

  const onKeyDownInTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (
        !tags.includes((e.target as any).value) &&
        (e.target as any).value !== ""
      ) {
        setTags([...tags, (e.target as any).value]);
      }
      (e.target as any).value = "";
      e.preventDefault();
    }
  };

  const onBadgeDeleteClick = (tag: string) => () => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onCloseButtonClick = async () => {
    console.log("called");
    setEnableEditDetails(false);
  };
  return enableEditDetails ? (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => {
            return (
              <Badge className="text-sm" variant="secondary" key={index}>
                {tag}
                <X className="size-4" onClick={onBadgeDeleteClick(tag)} />
              </Badge>
            );
          })}
        </div>
        <Input onKeyDown={onKeyDownInTagInput} placeholder="Add new Tag" />
      </div>
      <div className="flex flex-row-reverse gap-2">
        <Button size="sm" onClick={onSaveChangeButtonClick}>
          Save Changes
        </Button>
        <Button size="sm" onClick={() => setEnableEditDetails(false)}>
          Close
        </Button>
      </div>
    </div>
  ) : (
    <div className="hover:cursor-pointer" onClick={onDetailsClick}>
      <Data
        label={"Description"}
        value={description ?? "No description found"}
      />
      <Data
        label={"Tags"}
        value={
          tags.length > 0 ? (
            <div className="flex gap-1">
              {tags.map((tag, index) => {
                return (
                  <Badge className="text-sm" variant="secondary" key={index}>
                    {tag}
                  </Badge>
                );
              })}
            </div>
          ) : (
            ("No Tags found" as any)
          )
        }
      />
    </div>
  );
};
export default VideoDetailsComponent;
