import React, { useEffect, useRef } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import crypto from "crypto";

const PlyrHlsPlayer = ({
  source,
  thumbnailUrl,
}: {
  source: string;
  thumbnailUrl: string;
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const generateSecureUrl = (
    fullUrl: string,
    ttlInSec: number,
    secret: string,
  ): string => {
    // Parse the URL to extract baseUrl and path
    const url = new URL(fullUrl);
    const baseUrl = `${url.protocol}//${url.host}`;
    const path = url.pathname;

    const expires = Math.floor(Date.now() / 1000) + ttlInSec;

    // Token generation
    const tokenString = `${expires}${path} ${secret}`;
    console.log("Token String:", tokenString);
    const tokenHash = crypto.createHash("md5").update(tokenString).digest();
    const token = Buffer.from(tokenHash)
      .toString("base64")
      .replace(/\n/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    return `${baseUrl}${path}?md5=${token}&expires=${expires}`;
  };

  useEffect(() => {
    const defaultOptions = {
      quality: undefined,
      i18n: undefined,
    };

    if (!Hls.isSupported()) {
      // @ts-ignore
      videoRef.current.src = source;
    } else {
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
                // Use the generateSecuredUrl function we defined above
                context.url = generateSecureUrl(
                  context.url,
                  3600 * 5,
                  process.env.NEXT_PUBLIC_GOTIPATH_SECRET as any,
                );
              }
              return originalLoad(context, config, callbacks);
            };
          }
        } as any,
      });
      // @ts-ignore
      hlsRef.current = hls;
      hls.loadSource(source);

      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        const availableQualities = hls.levels.map((l) => l.height);
        availableQualities.unshift(0);

        // @ts-ignore
        defaultOptions.quality = {
          default: 0,
          options: availableQualities,
          forced: true,
          onChange: (e: any) => updateQuality(e),
        };

        // @ts-ignore
        defaultOptions.i18n = {
          qualityLabel: {
            0: "Auto",
          },
        };

        hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
          const span = document.querySelector(
            ".plyr__menu__container [data-plyr='quality'][value='0'] span",
          );
          if (hls.autoLevelEnabled) {
            // @ts-ignore
            span.innerHTML = `AUTO (${hls.levels[data.level].height}p)`;
          } else {
            // @ts-ignore
            span.innerHTML = `AUTO`;
          }
        });

        // @ts-ignore
        const player = new Plyr(videoRef.current, defaultOptions);
        player.poster = thumbnailUrl;
      });

      // @ts-ignore
      hls.attachMedia(videoRef.current);
    }

    return () => {
      if (hlsRef.current) {
        // @ts-ignore
        hlsRef.current.destroy();
      }
    };
  }, []);

  function updateQuality(newQuality: any) {
    if (newQuality === 0) {
      // @ts-ignore
      hlsRef.current.currentLevel = -1;
    } else {
      // @ts-ignore
      hlsRef.current.levels.forEach((level, levelIndex) => {
        if (level.height === newQuality) {
          // @ts-ignore
          hlsRef.current.currentLevel = levelIndex;
        }
      });
    }
  }

  return (
    <div className="h-fit">
      <video ref={videoRef}></video>
    </div>
  );
};

export default PlyrHlsPlayer;
