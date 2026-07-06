import { useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import { withSpring } from "react-native-reanimated";
import type { FloatingPosition } from "./useFloatingPosition";

const MAX_PULL = 48;          // 최대 이탈 거리
const SPRING = { damping: 14, stiffness: 180, mass: 0.8 };

// rubber band: 당길수록 저항 증가 (iOS 스크롤 감각)
function rubber(v: number): number {
  "worklet";
  const sign = v < 0 ? -1 : 1;
  const abs = Math.abs(v);
  return sign * MAX_PULL * (1 - 1 / (abs / MAX_PULL + 1));
}

export function useNodeDrag(position: FloatingPosition) {
  return useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          position.isDragging.value = true;
        })
        .onUpdate((e) => {
          position.dragX.value = rubber(e.translationX);
          position.dragY.value = rubber(e.translationY);
        })
        .onFinalize(() => {
          position.dragX.value = withSpring(0, SPRING);
          position.dragY.value = withSpring(0, SPRING);
          position.isDragging.value = false;
        }),
    [position]
  );
}
