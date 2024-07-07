import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import LinkImportDialog from "@/components/ui/link-import-dialog";
import { useMutation } from "@apollo/client";
import { CREATE_ASSET_MUTATION } from "@/api/graphql/queries/query";
import MyDeviceDialog from "@/components/ui/my-device-dialog";

const UploadNew = ({ refetch }: { refetch: () => void }) => {
  const [createVideo] = useMutation(CREATE_ASSET_MUTATION);

  const [openLinkImportDialog, setOpenLinkImportDialog] = React.useState(false);
  const [openMyDeviceDialog, setOpenMyDeviceDialog] = React.useState(false);

  const onLinkClick = () => {
    setOpenLinkImportDialog(true);
  };

  const onMyDeviceClick = () => {
    setOpenMyDeviceDialog(true);
  };
  const onLinkSubmit = async (
    sourceUrl: string,
    title: string,
    description: string,
  ) => {
    let res = await createVideo({
      variables: {
        source_url: sourceUrl,
        title: title,
        description: description,
      },
    });
    console.log("Success:", res);
    setOpenLinkImportDialog(false);
    refetch();
  };

  const onFileSubmit = async (fileName: string) => {
    // let res = await createAssetFromUpload({
    //   variables: {
    //     file_name: fileName,
    //   },
    // });
    // console.log("Success:", res);

    setOpenMyDeviceDialog(false);
    refetch();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Upload New <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onLinkClick}>Link</DropdownMenuItem>
          <DropdownMenuItem onClick={onMyDeviceClick}>
            My Device
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LinkImportDialog
        open={openLinkImportDialog}
        setOpen={setOpenLinkImportDialog}
        onSubmit={onLinkSubmit}
      />
      <MyDeviceDialog
        open={openMyDeviceDialog}
        setOpen={setOpenMyDeviceDialog}
        onSubmit={onFileSubmit}
      />
    </>
  );
};

export default UploadNew;
