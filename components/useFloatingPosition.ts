import { useEffect, useState } from "react";
import {
    Easing,
    cancelAnimation,
    runOnJS,
    useAnimatedReaction,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

export interface FloatingPosition {
    dx: ReturnType<typeof useSharedValue<number>>;
    dy: ReturnType<typeof useSharedValue<number>>;

    dragX: ReturnType<typeof useSharedValue<number>>;
    dragY: ReturnType<typeof useSharedValue<number>>;

    isDragging: ReturnType<typeof useSharedValue<boolean>>;
}

// index 기반 결정적 파라미터 — Math.random() 금지 원칙 준수
function paramsFor(index: number) {
    const amp = 12 + ((index * 37) % 50) / 10;
    const durX = 2600 + ((index * 53) % 7) * 300;     // 주기 2.6s ~ 4.4s
    const durY = 3100 + ((index * 71) % 7) * 300;
    const delay = ((index * 97) % 5) * 180;           // 위상 어긋남
    return { amp, durX, durY, delay };
}

export function useFloatingPosition(index: number, enabled: boolean): FloatingPosition {
    const dx = useSharedValue(0);
    const dy = useSharedValue(0);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const [dragging, setDragging] = useState(false);

    useAnimatedReaction(
        () => isDragging.value,
        (current, previous) => {
            if (current !== previous) {
                runOnJS(setDragging)(current);
            }
        }
    );

    const active = enabled && !dragging;

    useEffect(() => {
        if (!active) {
            cancelAnimation(dx);
            cancelAnimation(dy);
            dx.value = withTiming(0, { duration: 200 });
            dy.value = withTiming(0, { duration: 200 });
            return;
        }
        const { amp, durX, durY, delay } = paramsFor(index);
        const ease = Easing.inOut(Easing.sin);

        dx.value = withDelay(
            delay,
            withRepeat(withTiming(amp, { duration: durX, easing: ease }), -1, true)
        );
        dy.value = withDelay(
            delay,
            withRepeat(withTiming(-amp, { duration: durY, easing: ease }), -1, true)
        );

        return () => {
            cancelAnimation(dx);
            cancelAnimation(dy);
        };
    }, [index, active, dx, dy]);

    return {
        dx,
        dy,
        dragX,
        dragY,
        isDragging,
    };
}
