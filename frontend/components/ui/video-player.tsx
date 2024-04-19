import React, { useEffect, useRef } from "react";
import Plyr from "plyr";
import Hls from "hls.js";

const PlyrHlsPlayer = ({ source }: { source: string }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const defaultOptions = {};

    if (!Hls.isSupported()) {
      videoRef.current.src = source;
      const player = new Plyr(videoRef.current, defaultOptions);
    } else {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(source);

      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        const availableQualities = hls.levels.map((l) => l.height);
        availableQualities.unshift(0);

        defaultOptions.quality = {
          default: 0,
          options: availableQualities,
          forced: true,
          onChange: (e) => updateQuality(e),
        };

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
            span.innerHTML = `AUTO (${hls.levels[data.level].height}p)`;
          } else {
            span.innerHTML = `AUTO`;
          }
        });

        const player = new Plyr(videoRef.current, defaultOptions);
      });

      hls.attachMedia(videoRef.current);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  function updateQuality(newQuality) {
    if (newQuality === 0) {
      hlsRef.current.currentLevel = -1;
    } else {
      hlsRef.current.levels.forEach((level, levelIndex) => {
        if (level.height === newQuality) {
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
