import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Svg, {
  Circle,
  Line,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Path,
  Text as SvgText,
} from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { Person } from "@/context/AppContext";

interface ConnectionMapProps {
  people: Person[];
  userName: string;
  onPersonPress?: (id: string) => void;
  onAddPress?: () => void;
  size?: number;
}

const MAX_SLOTS = 7;
const CENTER_R = 42;
const NODE_R = 28;
const EMPTY_R = 22;

// Warm avatar color palettes for person nodes
const AVATAR_PALETTES = [
  ["#FFB347", "#FF8A65"],
  ["#FFCC80", "#FFA040"],
  ["#A5D6A7", "#66BB6A"],
  ["#90CAF9", "#42A5F5"],
  ["#CE93D8", "#AB47BC"],
  ["#F48FB1", "#EC407A"],
  ["#80DEEA", "#26C6DA"],
];

function getAvatarPalette(index: number) {
  return AVATAR_PALETTES[index % AVATAR_PALETTES.length];
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

  const sorted = useMemo(
    () => [...people].sort((a, b) => b.photoCount - a.photoCount),
    [people]
  );

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

  const short = (name: string) => (name.length > 4 ? name.slice(0, 4) : name);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          {/* Center gradient — warm coral */}
          <RadialGradient id="cg" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFAB80" />
            <Stop offset="100%" stopColor="#FF7043" />
          </RadialGradient>
          {/* Person node gradients */}
          {sorted.map((_, i) => {
            const [c1, c2] = getAvatarPalette(i);
            return (
              <RadialGradient key={i} id={`ng${i}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={c1} />
                <Stop offset="100%" stopColor={c2} />
              </RadialGradient>
            );
          })}
        </Defs>

        {/* Sparkle decorations */}
        <Sparkle x={cx - 22} y={cy - orbitR * 0.52} size={6} color="#FFB347" />
        <Sparkle x={cx + orbitR * 0.52} y={cy - 18} size={5} color="#FFCCAA" />
        <Sparkle x={cx + 20} y={cy + orbitR * 0.48} size={7} color="#FFB347" />
        <Sparkle x={cx - orbitR * 0.48} y={cy + 12} size={4} color="#FFA080" />

        {/* Lines to person nodes */}
        {sorted.map((person, i) => (
          <Line
            key={`l-${person.id}`}
            x1={cx} y1={cy}
            x2={allPositions[i].x} y2={allPositions[i].y}
            stroke="#FF8A65"
            strokeWidth={1.5 + (person.photoCount / 20) * 2.5}
            strokeOpacity={0.25 + (person.photoCount / 20) * 0.3}
            strokeLinecap="round"
          />
        ))}

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

        {/* Person nodes */}
        {sorted.map((person, i) => {
          const pos = allPositions[i];
          if (!pos) return null;
          return (
            <React.Fragment key={person.id}>
              <Circle cx={pos.x} cy={pos.y} r={NODE_R + 6} fill={colors.secondary} opacity={0.6} />
              <Circle cx={pos.x} cy={pos.y} r={NODE_R} fill={`url(#ng${i})`} />
              <SvgText
                x={pos.x} y={pos.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize={13}
                fontWeight="700"
                onPress={() => onPersonPress?.(person.id)}
              >
                {person.name.charAt(0)}
              </SvgText>
              <SvgText
                x={pos.x} y={pos.y + NODE_R + 16}
                textAnchor="middle"
                fill={colors.foreground}
                fontSize={11}
                fontWeight="500"
                onPress={() => onPersonPress?.(person.id)}
              >
                {short(person.name)}
              </SvgText>
            </React.Fragment>
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

        {/* Center node */}
        <Circle cx={cx} cy={cy} r={CENTER_R + 7} fill="#FFF0E8" opacity={0.7} />
        <Circle cx={cx} cy={cy} r={CENTER_R} fill="url(#cg)" />
        <SvgText
          x={cx} y={cy + 6}
          textAnchor="middle"
          fill="white"
          fontSize={16}
          fontWeight="700"
        >
          {short(userName)}
        </SvgText>
      </Svg>

      {/* Badge overlays */}
      {sorted.map((person, i) => {
        const pos = allPositions[i];
        if (!pos) return null;
        const isCouple = person.isCouple;
        return (
          <TouchableOpacity
            key={`badge-${person.id}`}
            onPress={() => onPersonPress?.(person.id)}
            style={[
              styles.badge,
              {
                left: pos.x + NODE_R * 0.55,
                top: pos.y - NODE_R * 0.55,
                backgroundColor: isCouple ? "#F06292" : "#FF8A65",
              },
            ]}
          >
            {isCouple ? (
              <Text style={styles.badgeHeart}>♡</Text>
            ) : (
              <Text style={styles.badgeText}>{person.photoCount}회</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 28,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  badgeHeart: {
    color: "white",
    fontSize: 9,
  },
});
