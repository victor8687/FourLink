import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

const PARTICLE_COUNT = 6;

// index 기반 결정적 파라미터 — 리렌더에 면역
function particleParams(index: number, size: number) {
  return {
    x: ((index * 149) % 90) / 100 * size + size * 0.05,
    startY: size * (0.55 + ((index * 83) % 40) / 100),
    rise: 40 + ((index * 61) % 40),          // 상승 거리 40~80px
    dot: 2 + ((index * 43) % 3),             // 크기 2~4px
    duration: 6000 + ((index * 101) % 5) * 800,  // 6~10초
    delay: ((index * 131) % 6) * 700,
    maxOpacity: 0.2 + ((index * 59) % 16) / 100, // 0.2~0.35
  };
}

function Particle({ index, size }: { index: number; size: number }) {
  const progress = useSharedValue(0);
  const p = particleParams(index, size);

  useEffect(() => {
    progress.value = withDelay(
      p.delay,
      withRepeat(
        withTiming(1, { duration: p.duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    return () => cancelAnimation(progress);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    // 페이드 인(0~0.2) → 유지 → 페이드 아웃(0.7~1)
    const opacity =
      t < 0.2 ? (t / 0.2) * p.maxOpacity
      : t > 0.7 ? ((1 - t) / 0.3) * p.maxOpacity
      : p.maxOpacity;
    return {
      opacity,
      transform: [{ translateY: -p.rise * t }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: p.x,
          top: p.startY,
          width: p.dot,
          height: p.dot,
          borderRadius: p.dot / 2,
        },
        style,
      ]}
    />
  );
}

export function ParticleLayer({ size }: { size: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <Particle key={i} index={i} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    backgroundColor: "#FFB347",
  },
});
