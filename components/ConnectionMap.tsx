import { AnimatedConnection } from "@/components/AnimatedConnection";
import { CenterNode } from "@/components/CenterNode";
import { FloatingNode } from "@/components/FloatingNode";
import {
  FloatingPosition,
  useFloatingPosition,
} from "@/components/useFloatingPosition";
import { Person, Photo } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import React, { useMemo } from "react";
import { Dimensions, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Text as SvgText
} from "react-native-svg";
import { ParticleLayer } from "./ParticleLayer";

interface ConnectionMapProps {
  people: Person[];
  photos: Photo[];
  userName: string;
  onPersonPress?: (id: string) => void;
  onAddPress?: () => void;
  size?: number;
}

const MAX_SLOTS = 7;
const CENTER_R = 42;
const NODE_R = 28;
const EMPTY_R = 22;

function useNodePositions(activeCount: number): FloatingPosition[] {

  const p0 = useFloatingPosition(0, activeCount > 0);
  const p1 = useFloatingPosition(1, activeCount > 1);
  const p2 = useFloatingPosition(2, activeCount > 2);
  const p3 = useFloatingPosition(3, activeCount > 3);
  const p4 = useFloatingPosition(4, activeCount > 4);
  const p5 = useFloatingPosition(5, activeCount > 5);
  const p6 = useFloatingPosition(6, activeCount > 6);

  return [
    p0,
    p1,
    p2,
    p3,
    p4,
    p5,
    p6,
  ];
}

function Sparkle({
  x, y, size = 7, color = "#FFB347",
}: {
  x: number; y: number; size?: number; color?: string;
}) {
  const s = size;
  return (
    <Path
      d={`M${x},${y - s} L${x + s * 0.22},${y - s * 0.22} L${x + s},${y} L${x + s * 0.22},${y + s * 0.22} L${x},${y + s} L${x - s * 0.22},${y + s * 0.22} L${x - s},${y} L${x - s * 0.22},${y - s * 0.22} Z`}
      fill={color}
      opacity={0.65}
    />
  );
}

export function ConnectionMap({
  people,
  photos,
  userName,
  onPersonPress,
  onAddPress,
  size: propSize,
}: ConnectionMapProps) {
  const colors = useColors();
  const { width } = Dimensions.get("window");
  const size = propSize ?? width - 32;
  const cx = size / 2;
  const cy = size / 2;
  const orbitR = size * 0.38;

  const photoCountMap = useMemo(() => {
    const map = new Map<string, number>();

    for (const person of people) {
      map.set(person.id, 0);
    }

    for (const photo of photos) {
      for (const id of photo.taggedPeople) {
        map.set(id, (map.get(id) ?? 0) + 1);
      }
    }

    return map;
  }, [people, photos]);

  const sorted = useMemo(() => {
    return [...people].sort(
      (a, b) =>
        (photoCountMap.get(b.id) ?? 0) -
        (photoCountMap.get(a.id) ?? 0)
    );
  }, [people, photoCountMap]);

  const emptyCount = Math.max(0, Math.min(2, MAX_SLOTS - sorted.length));

  const allPositions = useMemo(() => {
    const n = sorted.length + emptyCount;
    if (n === 0) return [];
    return Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return {
        x: cx + orbitR * Math.cos(angle),
        y: cy + orbitR * Math.sin(angle),
      };
    });
  }, [sorted.length, emptyCount, cx, cy, orbitR]);

  const nodePositions = useNodePositions(sorted.length);

  const short = (name: string) => (name.length > 4 ? name.slice(0, 4) : name);

  return (
    <View style={{ width: size, height: size }}>
      <ParticleLayer size={size} />
      <Svg width={size} height={size}>

        {/* Sparkle decorations */}
        <Sparkle x={cx - 22} y={cy - orbitR * 0.52} size={6} color="#FFB347" />
        <Sparkle x={cx + orbitR * 0.52} y={cy - 18} size={5} color="#FFCCAA" />
        <Sparkle x={cx + 20} y={cy + orbitR * 0.48} size={7} color="#FFB347" />
        <Sparkle x={cx - orbitR * 0.48} y={cy + 12} size={4} color="#FFA080" />

        {/* Animated Lines */}
        {sorted.map((person, i) => {
          const pos = allPositions[i];
          if (!pos) return null;

          return (
            <AnimatedConnection
              key={`l-${person.id}`}
              cx={cx}
              cy={cy}
              x={pos.x}
              y={pos.y}
              position={nodePositions[i]}
              photoCount={photoCountMap.get(person.id) ?? 0}
            />
          );
        })}

        {/* Lines to empty slots */}
        {Array.from({ length: emptyCount }, (_, i) => {
          const pos = allPositions[sorted.length + i];
          if (!pos) return null;
          return (
            <Line
              key={`le-${i}`}
              x1={cx} y1={cy}
              x2={pos.x} y2={pos.y}
              stroke={colors.border}
              strokeWidth={1}
              strokeOpacity={0.6}
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          );
        })}

        {/* Empty slot circles */}
        {Array.from({ length: emptyCount }, (_, i) => {
          const pos = allPositions[sorted.length + i];
          if (!pos) return null;
          return (
            <React.Fragment key={`empty-${i}`}>
              <Circle
                cx={pos.x} cy={pos.y} r={EMPTY_R}
                fill="none"
                stroke={colors.border}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                onPress={onAddPress}
              />
              <SvgText
                x={pos.x} y={pos.y + 6}
                textAnchor="middle"
                fill={colors.mutedForeground}
                fontSize={16}
                fontWeight="300"
                onPress={onAddPress}
              >
                +
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      <CenterNode
        cx={cx}
        cy={cy}
        userName={userName}
      />

      {sorted.map((person, i) => {
        const pos = allPositions[i];
        if (!pos) return null;

        return (
          <FloatingNode
            key={person.id}
            person={person}
            index={i}
            x={pos.x}
            y={pos.y}
            photoCount={photoCountMap.get(person.id) ?? 0}
            haloColor={colors.secondary}
            labelColor={colors.foreground}
            onPress={onPersonPress}
            position={nodePositions[i]}
          />
        );
      })}
    </View>
  );
}