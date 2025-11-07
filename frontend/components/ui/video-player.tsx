import React, { useEffect, useRef } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";

interface PlyrHlsPlayerProps {
  masterUrl?: string;
  thumbnailUrl?: string;
}

const PlyrHlsPlayer: React.FC<PlyrHlsPlayerProps> = ({
  masterUrl,
  thumbnailUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Plyr
    playerRef.current = new Plyr(videoRef.current, {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "captions",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
      ],
      settings: ["captions", "quality", "speed"],
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current || !masterUrl) return;

    const hls = new Hls();

    if (Hls.isSupported()) {
      hls.loadSource(masterUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded, ready to play');
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = masterUrl;
    }

    return () => {
      hls.destroy();
    };
  }, [masterUrl]);

  return (
    <div
      className="video-player-container"
      style={{
        backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <video
        ref={videoRef}
        className="plyr-react plyr video-player-element"
        crossOrigin="anonymous"
        playsInline
        poster={thumbnailUrl}
      />
    </div>
  );
};

export default PlyrHlsPlayer;
