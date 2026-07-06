import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

export const CENTER_R = 42;
const HALO_R = CENTER_R + 7;
const BOX = HALO_R * 2;

const short = (name: string) => (name.length > 4 ? name.slice(0, 4) : name);

interface CenterNodeProps {
  cx: number;
  cy: number;
  userName: string;
}

export function CenterNode({ cx, cy, userName }: CenterNodeProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.04, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    return () => cancelAnimation(scale);
  }, [scale]);

  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { left: cx - HALO_R, top: cy - HALO_R }, breathStyle]}
    >
      <Svg width={BOX} height={BOX}>
        <Defs>
          <RadialGradient id="center-grad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFAB80" />
            <Stop offset="100%" stopColor="#FF7043" />
          </RadialGradient>
        </Defs>
        <Circle cx={HALO_R} cy={HALO_R} r={HALO_R} fill="#FFF0E8" opacity={0.7} />
        <Circle cx={HALO_R} cy={HALO_R} r={CENTER_R} fill="url(#center-grad)" />
      </Svg>
      <Text style={styles.name}>{short(userName)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: BOX,
    height: BOX,
  },
  name: {
    position: "absolute",
    top: 0,
    left: 0,
    width: BOX,
    height: BOX,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: BOX,
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
