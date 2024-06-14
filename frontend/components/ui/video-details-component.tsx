import Data from '@/components/ui/data';
import { useState } from 'react';
import { VideoDetails } from '@/api/graphql/types/video-details';

const VideoDetailsComponent = ({ videoDetails }: { videoDetails: VideoDetails }) => {
  const [enableEditDetails, setEnableEditDetails] = useState(false);
  const onDetailsClick = async () => {
    setEnableEditDetails(true);
  };


  return <div className="hover:cursor-pointer" onClick={onDetailsClick}>
    {enableEditDetails ? (<div>
      hello
    </div>) : <div>
      <Data
        label={'Tags'}
        value={
          videoDetails.tags.length > 0
            ? videoDetails.tags
            : ('No Tags found' as any)
        }
      />
      <Data
        label={'Description'}
        value={videoDetails.description ?? 'No description found'}
      />
    </div>}
  </div>;
};
export default VideoDetailsComponent;