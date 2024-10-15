import React, { useMemo } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css"

export const VideoJS = (props) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const {options, onReady} = props;

  React.useEffect(() => {

    if (window.location.pathname !== "/dash") {
      return
    }

    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      });

    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef, playerRef]);

  React.useEffect(() => {
    if (playerRef.current) {
      const player = playerRef.current;

      return () => {
        if (player && !player.isDisposed()) {
          player.dispose();
          playerRef.current = null;
        }
      };
    }
  }, [playerRef]);

  const renderElement = useMemo(() => {
    if (window.location.pathname === "/simple") {
      return <video autoplay controls src="http://localhost:3005/sample.mp4" width="50%"/>
    } else if (window.location.pathname === "/ranged-requests") {
      return <video autoplay controls src="http://localhost:3005/sample-in-chunks" width="50%"/>
    } else if (window.location.pathname === "/dash") {
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
    } else {
      return <></>
    }
  })

  // return renderElement
  return ( <div data-vjs-player> <div ref={videoRef} style={{ width: "50%" }}/> </div> )
}