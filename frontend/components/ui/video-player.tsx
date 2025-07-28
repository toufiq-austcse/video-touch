
import React, { useEffect, useRef } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";
import { PlaylistSignedUrlResponse } from "@/api/graphql/types/video-details";
import { VODPlaybackRes } from "@/api/types/vod-playback-res";

interface PlyrHlsPlayerProps {
  playlistSignedUrlResponse?: PlaylistSignedUrlResponse;
  vodPlaybackRes?: VODPlaybackRes;
  thumbnailUrl?: string;
}

const PlyrHlsPlayer: React.FC<PlyrHlsPlayerProps> = ({
                                                       playlistSignedUrlResponse,
                                                       vodPlaybackRes,
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
      settings: ["quality"],
      poster: thumbnailUrl,
    });

    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [thumbnailUrl]);

  useEffect(() => {
    if (!videoRef.current) return;

    const cdnProvider = process.env.NEXT_PUBLIC_CDN_PROVIDER;
    const hls = new Hls();

    if (cdnProvider === "cloudfront" && vodPlaybackRes) {
      // Set cookies for Cloudfront
      const { signed_cookies, media_sources } = vodPlaybackRes;

      // Assuming the first media source is the HLS stream
      const hlsUrl = media_sources[0]?.file;
      console.log('');

      if (!hlsUrl) {
        console.error("No HLS URL found in vodPlaybackRes");
        return;
      }

      // Attach HLS to video element
      if (Hls.isSupported()) {
        hls.loadSource(hlsUrl);
        hls.attachMedia(videoRef.current);

        // Handle quality levels
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          const availableQualities = hls.levels.map((level) => ({
            src: level.url,
            type: "hls",
            size: level.height,
          }));

          if (playerRef.current) {
            playerRef.current.source = {
              type: "video",
              sources: availableQualities,
            };
          }
        });
      }
    } else if (cdnProvider === "gotipath" && playlistSignedUrlResponse) {
      // Original Gotipath implementation
      const { main_playlist_url, resolutions_token } = playlistSignedUrlResponse;

      if (Hls.isSupported()) {
        hls.loadSource(main_playlist_url);
        hls.attachMedia(videoRef.current);

        // Handle quality levels for Gotipath
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          const availableQualities = Object.entries(resolutions_token).map(
            ([quality, token]) => ({
              src: token,
              type: "hls",
              size: parseInt(quality),
            })
          );

          if (playerRef.current) {
            playerRef.current.source = {
              type: "video",
              sources: availableQualities,
            };
          }
        });
      }
    }

    // Cleanup function
    return () => {
      hls.destroy();
    };
  }, [playlistSignedUrlResponse, vodPlaybackRes]);

  return (
    <video
      ref={videoRef}
      className="plyr-react plyr"
      crossOrigin="anonymous"
      playsInline
    />
  );
};

export default PlyrHlsPlayer;