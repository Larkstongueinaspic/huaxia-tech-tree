// ============================================================
// useAutoPlay.js
// 自动播放定时器逻辑
// ============================================================

import { useEffect, useRef } from "react";
import { AUTO_PLAY_INTERVAL } from "../utils/constants";

export function useAutoPlay(playing, stepsLength, setSi, setPlaying, steps, panToNode, POS, si) {
  const timerRef = useRef(null);
  const prevSiRef = useRef(null);

  useEffect(() => {
    if (playing) {
      prevSiRef.current = null; // 重置，每次播放从头开始
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

  // step 推进时触发 panToNode
  useEffect(() => {
    if (stepsLength === 0) return;
    const curStep = steps[si];
    if (curStep?.cur && si !== prevSiRef.current) {
      prevSiRef.current = si;
      panToNode(curStep.cur, POS);
    }
  }, [si, steps, stepsLength, panToNode, POS]);
}
