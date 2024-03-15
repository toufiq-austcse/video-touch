import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { badgeVariants } from '@/components/ui/badge';

const videos = [
  {
    _id: 'INV001',
    title: 'Video 1',
    status: 'ready',
    duration: 15000,
    createdAt: new Date()
  },
  {
    _id: 'INV002',
    title: 'Video 2',
    status: 'failed',
    duration: 15000,
    createdAt: new Date()
  },
  {
    _id: 'INV002',
    title: 'Video 3',
    status: 'processing',
    duration: 15000,
    createdAt: new Date()
  }
];

export default function Home() {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video._id}>
              <TableCell>
                <div style={{ display: 'flex' }}>
                  <Image
                    src="/next.svg"
                    alt="Next.js Logo"
                    width={50}
                    height={50}
                    priority
                  />
                  <p>
                    {video.title}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <p
                  className={video.status === 'failed' ? badgeVariants({ variant: 'destructive' }) : video.status === 'processing' ? badgeVariants({ variant: 'default' }) : badgeVariants({ variant: 'secondary' })}>{video.status}</p>
              </TableCell>
              <TableCell>{video.duration}</TableCell>
              <TableCell>{video.createdAt.toDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

      </div>
    </>

  );
}
