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

const UploadNew = () => {
  const [openLinkImportDialog, setOpenLinkImportDialog] = React.useState(false);


  const onLinkClick = () => {
    setOpenLinkImportDialog(true);
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
      <LinkImportDialog open={openLinkImportDialog} setOpen={setOpenLinkImportDialog} />
    </>
  );
};

export default UploadNew;