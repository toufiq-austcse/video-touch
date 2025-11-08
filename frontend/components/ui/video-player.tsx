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
  const hlsRef = useRef<Hls | null>(null);

  const createPlayer = () => {
    if (!videoRef.current) return;

    // Destroy existing player if it exists
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    const videoOptions = {
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
      i18n: {
        qualityBadge: {
          0: "Auto",
          360: "360p",
          480: "480p",
          720: "720p HD",
          1080: "1080p FHD",
        },
      },
    } as any;

    // If HLS levels are available, add quality configuration
    if (hlsRef.current && hlsRef.current.levels.length > 0) {
      videoOptions.quality = {
        default: hlsRef.current.levels[hlsRef.current.levels.length - 1].height,
        options: hlsRef.current.levels.map((level) => level.height),
        forced: true,
        // Manage quality changes
        onChange: (quality: number) => {
          if (hlsRef.current) {
            hlsRef.current.levels.forEach((level, levelIndex) => {
              if (level.height === quality) {
                hlsRef.current!.currentLevel = levelIndex;
              }
            });
          }
        },
      };
    }

    // Initialize Plyr with the options
    playerRef.current = new Plyr(videoRef.current, videoOptions);

    // Reattach HLS if it exists
    if (hlsRef.current && videoRef.current) {
      hlsRef.current.attachMedia(videoRef.current);
    }
  };

  useEffect(() => {
    if (!videoRef.current || !masterUrl) return;

    const hls = new Hls();
    hlsRef.current = hls;

    if (Hls.isSupported()) {
      hls.loadSource(masterUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_LOADED, () => {
        console.log("HLS manifest loaded, ready to play");
        console.log("Available HLS levels:", hls.levels);

        // Use your provided code structure
        const videoOptions = {} as any;
        videoOptions.quality = {
          default: hls.levels[hls.levels.length - 1].height,
          options: hls.levels.map((level) => level.height),
          forced: true,
          // Manage quality changes
          onChange: (quality: number) => {
            hls.levels.forEach((level, levelIndex) => {
              if (level.height === quality) {
                hls.currentLevel = levelIndex;
              }
            });
          },
        };

        createPlayer();
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log("Quality level switched to:", data.level);

        // Update quality indicator in Plyr
        if (playerRef.current) {
          const currentLevel = hls.levels[data.level];
          const qualityText = currentLevel?.height
            ? `${currentLevel.height}p`
            : "Auto";
          console.log("Current quality:", qualityText);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      videoRef.current.src = masterUrl;
      // Create basic player without quality options for Safari
      createPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [masterUrl]);

  return (
    <div
      className="video-player-container"
      style={{
        backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
