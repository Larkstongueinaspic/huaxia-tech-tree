// ============================================================
// useAutoPlay.js
// 自动播放定时器逻辑
// ============================================================

import { useEffect, useRef } from "react";
import { AUTO_PLAY_INTERVAL } from "../utils/constants";

export function useAutoPlay(playing, stepsLength, setSi, setPlaying) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setSi(i => {
          if (i >= stepsLength - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, AUTO_PLAY_INTERVAL);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, stepsLength, setSi, setPlaying]);
}
