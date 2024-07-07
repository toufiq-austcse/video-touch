import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useRef } from "react";
import { FileInput, ProgressBar } from "@uppy/react";
import Tus from "@uppy/tus";
import { Uppy } from "@uppy/core";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import "@uppy/file-input/dist/style.css";
import "@uppy/progress-bar/dist/style.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const uppy = new Uppy({
  id: "file",
  debug: true,
}).use(Tus, {
  endpoint: `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/upload/files`,
  removeFingerprintOnSuccess: true,
  onAfterResponse: (request, response) => {
    console.log("onAfterResponse", response);
  },
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const MyDeviceDialog = ({
  open,
  setOpen,
  onSubmit,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (fileName: string) => void;
}) => {
  const videoInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files as any);

    files.forEach((file: any) => {
      try {
        uppy.addFile({
          source: "file input",
          name: file.name,
          type: file.type,
          data: file,
        });
      } catch (err: any) {
        if (err.isRestriction) {
          // handle restrictions
          console.log("Restriction error:", err);
        } else {
          // handle other errors
          console.error(err);
        }
      }
    });
  };

  uppy.on("file-removed", () => {
    (videoInputRef as any).value = null;
  });

  uppy.on("complete", () => {
    (videoInputRef as any).value = null;
  });

  const onUploadClick = async () => {
    if (uppy.getFiles().length == 0) {
      return;
    }
    let res = await uppy.upload();
    console.log("Upload response:", res);
    if (res.successful.length) {
      uppy.removeFile(res.successful[0].id);
      uppy.resetProgress();

      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
      let fileName = res.successful[0].uploadURL.split("/").pop();
      if (fileName) {
        console.log("fileName ", fileName);
        onSubmit(fileName);
      }
    }
    if (res.failed.length) {
      uppy.removeFile(res.failed[0].id);
      uppy.resetProgress();

      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }

      const pattern = /response text:\s*([^,]+)/;
      let err = res.failed[0].error;
      let match = err.match(pattern);
      if (match?.length) {
        return alert(`Upload failed: ${match[1]}`);
      }

      return alert("Upload failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
        </DialogHeader>
        <ProgressBar uppy={uppy} hideAfterFinish={false} />
        <Input
          ref={videoInputRef}
          id="video"
          type="file"
          accept="video/mp4"
          onChange={onFileChange}
        />
        <Button onClick={onUploadClick}>Upload</Button>
      </DialogContent>
    </Dialog>
  );
};
export default MyDeviceDialog;
