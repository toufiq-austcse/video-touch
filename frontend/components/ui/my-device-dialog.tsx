import { Dialog, DialogContent } from '@/components/ui/dialog';
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileInput, ProgressBar } from '@uppy/react';
import Tus from '@uppy/tus';
import { Uppy } from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/drag-drop/dist/style.css';
import '@uppy/file-input/dist/style.css';
import '@uppy/progress-bar/dist/style.css';

const uppy = new Uppy({
  id: 'file',
  autoProceed: true,
  debug: true
}).use(Tus, { endpoint: `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/upload` });

const formSchema = z.object({
  link: z.string().url({
    message: 'Please upload a file.'
  }),
  title: z.string().optional(),
  description: z.string().optional()
});
const MyDeviceDialog = ({
                          open,
                          setOpen,
                          onSubmit
                        }: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (file: any) => void;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: '',
      title: '',
      description: ''
    }
  });
  const onFormSubmit = async (values: z.infer<typeof formSchema>) => {
    // onSubmit(values.link, values.title as string, values.description as string);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <h1>Upload a file</h1>
        <h2>Progress Bar</h2>
        <ProgressBar
          uppy={uppy}
          hideAfterFinish={false}
        />

        <FileInput
          uppy={uppy}
        />
      </DialogContent>
      {/*<Form {...form}>*/}
      {/*  <form id="link-form" onSubmit={form.handleSubmit(onFormSubmit)}>*/}
      {/*    <DialogContent className="sm:max-w-md">*/}
      {/*      <DialogHeader>*/}
      {/*        <DialogTitle>Import From Link</DialogTitle>*/}
      {/*      </DialogHeader>*/}
      {/*      <FormField*/}
      {/*        control={form.control}*/}
      {/*        name="link"*/}
      {/*        render={({ field }) => (*/}
      {/*          <FormItem>*/}
      {/*            <FormLabel>Link</FormLabel>*/}
      {/*            <FormControl>*/}
      {/*              <Input*/}
      {/*                placeholder="Enter URL to import a file"*/}
      {/*                {...field}*/}
      {/*              />*/}
      {/*            </FormControl>*/}
      {/*            <FormMessage />*/}
      {/*          </FormItem>*/}
      {/*        )}*/}
      {/*      />*/}

      {/*      <FormField*/}
      {/*        control={form.control}*/}
      {/*        name="title"*/}
      {/*        render={({ field }) => (*/}
      {/*          <FormItem>*/}
      {/*            <FormLabel>Title</FormLabel>*/}
      {/*            <FormControl>*/}
      {/*              <Input {...field} />*/}
      {/*            </FormControl>*/}
      {/*            <FormMessage />*/}
      {/*          </FormItem>*/}
      {/*        )}*/}
      {/*      />*/}

      {/*      <FormField*/}
      {/*        control={form.control}*/}
      {/*        name="description"*/}
      {/*        render={({ field }) => (*/}
      {/*          <FormItem>*/}
      {/*            <FormLabel>Description</FormLabel>*/}
      {/*            <FormControl>*/}
      {/*              <Textarea {...field} />*/}
      {/*            </FormControl>*/}
      {/*            <FormMessage />*/}
      {/*          </FormItem>*/}
      {/*        )}*/}
      {/*      />*/}
      {/*      <DialogFooter>*/}
      {/*        <Button type="submit" size="sm" form="link-form">*/}
      {/*          Import*/}
      {/*        </Button>*/}
      {/*      </DialogFooter>*/}
      {/*    </DialogContent>*/}
      {/*  </form>*/}
      {/*</Form>*/}
    </Dialog>
  );
};
export default MyDeviceDialog;
