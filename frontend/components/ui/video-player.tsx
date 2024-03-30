import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';

const VideoPlayer = ({ source }: { source: string }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const player = new Plyr(videoRef.current as any);

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, []);

  return (
    <video ref={videoRef}>
      <source src={source} type="video/mp4" />
    </video>
  );
};

export default VideoPlayer;
