import React from "react";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import { Line } from "react-native-svg";
import type { FloatingPosition } from "./useFloatingPosition";

const AnimatedLine = Animated.createAnimatedComponent(Line);

interface AnimatedConnectionProps {
    cx: number;
    cy: number;
    x: number;             // 노드 기준 좌표
    y: number;
    position: FloatingPosition;  // 노드와 동일한 sharedValue
    photoCount: number;
}

export function AnimatedConnection({
    cx, cy, x, y, position, photoCount,
}: AnimatedConnectionProps) {
    const animatedProps = useAnimatedProps(() => ({
        x2: x + position.dx.value + position.dragX.value,
        y2: y + position.dy.value + position.dragY.value,
    }));
    
    return (
        <AnimatedLine
            x1={cx}
            y1={cy}
            animatedProps={animatedProps}
            stroke="#FF8A65"
            strokeWidth={1.5 + (photoCount / 20) * 2.5}
            strokeOpacity={0.25 + (photoCount / 20) * 0.3}
            strokeLinecap="round"
        />
    );
}
