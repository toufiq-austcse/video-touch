import Data from '@/components/ui/data';
import React, { useState } from 'react';
import { VideoDetails } from '@/api/graphql/types/video-details';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { Asset } from '@/api/graphql/graphql';
import { UPDATE_ASSET_MUTATION } from '@/api/graphql/queries/query';

const formSchema = z.object({
  description: z.string().optional(),
  tags: z.string().array().optional()
});

const VideoDetailsComponent = ({
                                 videoDetails
                               }: {
  videoDetails: VideoDetails;
}) => {
  const [enableEditDetails, setEnableEditDetails] = useState(false);
  const [tags, setTags] = useState<string[]>(videoDetails.tags);
  const [tagInput, setTagInput] = useState<string>('');
  const [updateAsset] = useMutation<Asset>(UPDATE_ASSET_MUTATION);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: videoDetails.description ?? '',
      tags: []
    }
  });

  const onDetailsClick = async () => {
    setEnableEditDetails(true);
  };


  const onFormSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('onFormSubmit');
    values.tags = tags;
    console.log(values);
    let res = await updateAsset({
      variables: {
        id: videoDetails._id,
        description: values.description,
        tags: values.tags
      }
    });
    // videoDetails.tags = res.data?.tags as any;
    // videoDetails.description = res.data?.description as any;
    setEnableEditDetails(false);
    // onSubmit(values.link, values.title as string, values.description as string);
    // form.reset();
  };


  const onKeyDownInTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!tags.includes((e.target as any).value) && (e.target as any).value !== '') {
        setTags([...tags, (e.target as any).value]);
      }
      (e.target as any).value = '';
      e.preventDefault();
    }
  };

  const onBadgeDeleteClick = (tag: string) => () => {
    setTags(tags.filter(t => t !== tag));
  };

  const onCloseButtonClick = (e: React.FormEvent) => {
    e.preventDefault();

    setEnableEditDetails(false);
    console.log('called ', enableEditDetails);
    // form.setValue('description', videoDetails.description as any);
    // setTags(videoDetails.tags);

  };

  return enableEditDetails ? (
    <div>
      <Form {...form}>
        <form id="edit-details" onSubmit={form.handleSubmit(onFormSubmit)}>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Tags</FormLabel>
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
            <FormControl>
              <Input type="text" value={tagInput} onKeyDown={onKeyDownInTagInput}
                     onChange={e => setTagInput(e.target.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
          <div className="flex flex-row-reverse gap-2">
            <Button type="submit" size="sm" form="edit-details">
              Save
            </Button>
            <Button size="sm" onClick={onCloseButtonClick}>
              Close
            </Button>
          </div>

        </form>
      </Form>
    </div>
  ) : (
    <div className="hover:cursor-pointer" onClick={onDetailsClick}>
      <Data
        label={'Description'}
        value={videoDetails.description ?? 'No description found'}
      />
      <Data
        label={'Tags'}
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
            ('No Tags found' as any)
          )
        }
      />
    </div>);

};
export default VideoDetailsComponent;
