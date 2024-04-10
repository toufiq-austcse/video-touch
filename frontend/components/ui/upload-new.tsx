import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import LinkImportDialog from '@/components/ui/link-import-dialog';
import { useMutation } from '@apollo/client';
import { CREATE_VIDEO_MUTATION } from '@/api/graphql/queries/query';

const UploadNew = ({ refetch }: { refetch: () => void }) => {
  const [createVideo] = useMutation(CREATE_VIDEO_MUTATION);
  const [openLinkImportDialog, setOpenLinkImportDialog] = React.useState(false);

  const onLinkClick = () => {
    setOpenLinkImportDialog(true);
  };

  const onSubmit = async (sourceUrl: string, title: string, description: string) => {
    let res = await createVideo({
      variables: {
        source_url: sourceUrl,
        title: title,
        description: description
      }
    });
    console.log('Success:', res);
    setOpenLinkImportDialog(false);
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
        </DropdownMenuContent>
      </DropdownMenu>
      <LinkImportDialog
        open={openLinkImportDialog}
        setOpen={setOpenLinkImportDialog}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default UploadNew;
