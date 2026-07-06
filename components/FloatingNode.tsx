import { Person } from "@/context/AppContext";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import type { FloatingPosition } from "./useFloatingPosition";
import { useNodeDrag } from "./useNodeDrag";

export const NODE_R = 28;

// 팔레트는 노드 소유이므로 이 파일로 이동
const AVATAR_PALETTES: [string, string][] = [
    ["#FFB347", "#FF8A65"],
    ["#FFCC80", "#FFA040"],
    ["#A5D6A7", "#66BB6A"],
    ["#90CAF9", "#42A5F5"],
    ["#CE93D8", "#AB47BC"],
    ["#F48FB1", "#EC407A"],
    ["#80DEEA", "#26C6DA"],
];

interface FloatingNodeProps {
    person: Person;
    index: number;
    x: number;            // 노드 중심 좌표
    y: number;
    photoCount: number;   // 부모가 Map으로 1회 계산해서 내려줌
    haloColor: string;
    labelColor: string;
    position: FloatingPosition;
    onPress?: (id: string) => void;
}

const short = (name: string) => (name.length > 4 ? name.slice(0, 4) : name);

// 컨테이너 크기: halo(NODE_R+6)가 잘리지 않게 여유 포함
const HALO_R = NODE_R + 6;
const BOX = HALO_R * 2;

export function FloatingNode({
    person, index, x, y, photoCount, haloColor, labelColor, position, onPress,
}: FloatingNodeProps) {
    const [c1, c2] = AVATAR_PALETTES[index % AVATAR_PALETTES.length];
    const gradId = `node-grad-${person.id}`;

    const drag = useNodeDrag(position);

    const floatStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX:
                    position.dx.value +
                    position.dragX.value,
            },
            {
                translateY:
                    position.dy.value +
                    position.dragY.value,
            },
            {
                scale: withTiming(
                    position.isDragging.value ? 1.08 : 1,
                    {
                        duration: 150,
                    }
                ),
            },
        ],
    }));

    return (
        <GestureDetector gesture={drag}>
            <Animated.View
                pointerEvents="box-none"
                style={[
                    styles.container,
                    {
                        left: x - HALO_R,
                        top: y - HALO_R,
                    },
                    floatStyle,
                ]}
            >
                {/* 원 (halo + 그라데이션 본체) */}
                <TouchableOpacity activeOpacity={0.8} onPress={() => onPress?.(person.id)}>
                    <Svg width={BOX} height={BOX}>
                        <Defs>
                            <RadialGradient id={gradId} cx="50%" cy="50%" r="50%">
                                <Stop offset="0%" stopColor={c1} />
                                <Stop offset="100%" stopColor={c2} />
                            </RadialGradient>
                        </Defs>
                        <Circle cx={HALO_R} cy={HALO_R} r={HALO_R} fill={haloColor} opacity={0.6} />
                        <Circle cx={HALO_R} cy={HALO_R} r={NODE_R} fill={`url(#${gradId})`} />
                    </Svg>
                    <Text style={styles.initial}>{person.name.charAt(0)}</Text>
                </TouchableOpacity>

                {/* 이름 */}
                <Text style={[styles.name, { color: labelColor }]} numberOfLines={1}>
                    {short(person.name)}
                </Text>

                {/* 배지 */}
                <TouchableOpacity
                    onPress={() => onPress?.(person.id)}
                    style={[
                        styles.badge,
                        { backgroundColor: person.isCouple ? "#F06292" : "#FF8A65" },
                    ]}
                >
                    {person.isCouple ? (
                        <Text style={styles.badgeHeart}>♡</Text>
                    ) : (
                        <Text style={styles.badgeText}>{photoCount}회</Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        width: BOX,
        alignItems: "center",
    },
    initial: {
        position: "absolute",
        top: 0,
        left: 0,
        width: BOX,
        height: BOX,
        textAlign: "center",
        textAlignVertical: "center",
        lineHeight: BOX,
        color: "white",
        fontSize: 13,
        fontWeight: "700",
    },
    name: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: "500",
        maxWidth: BOX + 20,
        textAlign: "center",
    },
    badge: {
        position: "absolute",
        left: HALO_R + NODE_R * 0.55,
        top: HALO_R - NODE_R * 0.55 - 8,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 28,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "white",
    },
    badgeText: { color: "white", fontSize: 8, fontFamily: "Poppins_600SemiBold" },
    badgeHeart: { color: "white", fontSize: 9 },
});
