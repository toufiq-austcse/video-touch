import VideoPlayer from '@/components/ui/video-player';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { StepBack } from 'lucide-react';
import Step from '@/components/ui/step';
import Data from '@/components/ui/data';

export default function VideoDetailsPage() {
  return <div className={'flex space-x-4'}>
    <div className={'flex flex-col space-y-4 p-8 border-2 rounded w-6/12'}>
      <div>
        <p className="text-2xl">Video Title</p>
      </div>

      <Separator />
      <div className={'border-2'}>
        <VideoPlayer source="https://s3.ap-southeast-1.amazonaws.com/cdn.10minuteschool.com/--3v8GIKxy0.mp4" />
      </div>
      <div>
        <div>
          <Label htmlFor="text">Description</Label>
        </div>
        <div>
          <Label htmlFor="text">Tags</Label>
        </div>
      </div>
    </div>
    <div className={'border-2 rounded space-y-4 p-8 w-6/12 h-3/6'}>
      <div>
        <Data label={'Status'} value={'Downloaded'} />
        <Data label={'Created At'} value={new Date().toDateString()} />
        <Data label={'Resolution'} value={'1920 x 1080'} />

      </div>
      <div className={'flex flex-col items-center'}>
        <div className={'flex justify-between'}>
          <Step title="Queued" />
          <Step title="Downlaoded" />
          <Step title="Validated" />
          <Step title="Processing" />
          <Step title="Ready" isFinal={true} />
        </div>
      </div>

    </div>

  </div>;
}