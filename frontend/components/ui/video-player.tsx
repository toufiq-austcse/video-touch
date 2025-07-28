import React, { useEffect, useRef } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";
import { PlaylistSignedUrlResponse } from "@/api/graphql/types/video-details";
import Cookies from "js-cookie";
import { VODPlaybackRes } from "@/contexts/types/vod-playback-res";

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
  console.log("playlistSignedUrlResponse ", playlistSignedUrlResponse);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  // Function to set Cloudfront cookies
  const setSignedCookies = (signedCookies: any) => {
    console.log('Setting signed cookies:', signedCookies);
    // Set cookies at domain level
    const domain = "video-touch.10minuteschool.com"; // Replace with your actual domain
    const cookieOptions = {
      domain,
      secure: true,
      sameSite: "strict" as const,
    };

    Cookies.set(
      "CloudFront-Policy",
      signedCookies.cloudfront_policy,
      cookieOptions,
    );
    Cookies.set(
      "CloudFront-Signature",
      signedCookies.cloudfront_signature,
      cookieOptions,
    );
    Cookies.set(
      "CloudFront-Key-Pair-Id",
      signedCookies.cloudfront_key_pair_id,
      cookieOptions,
    );
  };

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

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [thumbnailUrl]);

  useEffect(() => {
    if (!videoRef.current) return;

    const cdnProvider = process.env.NEXT_PUBLIC_CDN_PROVIDER;
    const hls = new Hls({
      xhrSetup: (xhr, url) => {
        xhr.withCredentials = true;
        // Set up custom headers for Cloudfront requests
        // if (cdnProvider === "cloudfront" && vodPlaybackRes?.signed_cookies) {
        //   xhr.withCredentials = true; // Important for sending cookies
        // }
      },
    });

    if (cdnProvider === "cloudfront" && vodPlaybackRes) {
      console.log("Using Cloudfront CDN with signed cookies");
      // Set Cloudfront signed cookies
      setSignedCookies(vodPlaybackRes.signed_cookies);

      const { media_sources } = vodPlaybackRes;
      const hlsUrl = media_sources[0]?.file;

      if (!hlsUrl) {
        console.error("No HLS URL found in vodPlaybackRes");
        return;
      }

      if (Hls.isSupported()) {
        hls.loadSource(hlsUrl);
        hls.attachMedia(videoRef.current);

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
      // Existing Gotipath implementation
      const { main_playlist_url, resolutions_token } = playlistSignedUrlResponse;

      if (Hls.isSupported()) {
        const hls = new Hls({
          pLoader: class CustomLoader extends Hls.DefaultConfig.loader {
            constructor(config: any) {
              super(config);
              const originalLoad = this.load.bind(this);
              this.load = function (context, config, callbacks) {
                if (
                  context &&
                  context.url &&
                  context.url.match(/\.m3u8($|\?)/i)
                ) {
                  console.log("context.url", context.url);
                  for (let playlistResponse of Object.keys(
                    playlistSignedUrlResponse.resolutions_token,
                  )) {
                    if (context.url.includes(playlistResponse)) {
                      // Generate a secure URL using the token
                      const token =
                        playlistSignedUrlResponse.resolutions_token[
                          playlistResponse
                          ];
                      context.url = `${context.url}?${token}`;
                    }
                  }
                  // Use the generateSecuredUrl function we defined above
                }
                return originalLoad(context, config, callbacks);
              };
            }
          } as any,
        });
        // @ts-ignore
        hlsRef.current = hls;
        hls.loadSource(playlistSignedUrlResponse.main_playlist_url);
      }
    }

    return () => {
      hls.destroy();
      // Clean up cookies when component unmounts
      if (cdnProvider === "cloudfront") {
        Cookies.remove("CloudFront-Policy");
        Cookies.remove("CloudFront-Signature");
        Cookies.remove("CloudFront-Key-Pair-Id");
      }
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
