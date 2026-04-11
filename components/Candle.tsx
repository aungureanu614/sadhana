// components/Candle.tsx
import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

interface CandleProps {
  size?: number;
  onPress?: () => void;
}

export function Candle({ size = 200, onPress }: CandleProps) {
  const [isLit, setIsLit] = useState(false);
  const flameAnimation = useSharedValue(0);
  const wickGlow = useSharedValue(0);

  React.useEffect(() => {
    if (isLit) {
      // Start flame animation
      flameAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );

      // Wick glow animation
      wickGlow.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      flameAnimation.value = withTiming(0, { duration: 200 });
      wickGlow.value = withTiming(0, { duration: 200 });
    }
  }, [isLit, flameAnimation, wickGlow]);

  const flameAnimatedStyle = useAnimatedStyle(() => {
    const scaleY = interpolate(flameAnimation.value, [0, 1], [0.8, 1.2]);
    const scaleX = interpolate(flameAnimation.value, [0, 1], [0.9, 1.1]);
    const translateY = interpolate(flameAnimation.value, [0, 1], [0, -2]);

    return {
      transform: [{ scaleY }, { scaleX }, { translateY }],
    };
  });

  const wickGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(wickGlow.value, [0, 1], [0.3, 0.8]);
    return { opacity };
  });

  const handlePress = () => {
    setIsLit(!isLit);
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={[styles.container, { width: size, height: size }]}>
      <View style={styles.candleContainer}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="candleGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#FFF8DC" />
              <Stop offset="70%" stopColor="#F5DEB3" />
              <Stop offset="100%" stopColor="#DEB887" />
            </RadialGradient>
            <RadialGradient id="flameGradient" cx="50%" cy="70%">
              <Stop offset="0%" stopColor="#FFFF00" />
              <Stop offset="30%" stopColor="#FF6600" />
              <Stop offset="70%" stopColor="#FF0000" />
              <Stop offset="100%" stopColor="#990000" />
            </RadialGradient>
          </Defs>

          {/* Candle body */}
          <Ellipse cx="50" cy="85" rx="12" ry="3" fill="url(#candleGradient)" />
          <Path
            d="M 38 85 L 38 40 Q 38 35 42 35 L 58 35 Q 62 35 62 40 L 62 85 Z"
            fill="url(#candleGradient)"
            stroke="#DEB887"
            strokeWidth="0.5"
          />

          {/* Wick */}
          <Path d="M 50 35 L 50 30" stroke="#2F4F4F" strokeWidth="1.5" strokeLinecap="round" />

          {/* Wick glow when lit */}
          {isLit && (
            <Animated.View style={[styles.wickGlow, wickGlowStyle]}>
              <Svg width={size} height={size} viewBox="0 0 100 100">
                <Ellipse cx="50" cy="30" rx="3" ry="1" fill="#FFD700" opacity="0.6" />
              </Svg>
            </Animated.View>
          )}
        </Svg>

        {/* Flame */}
        {isLit && (
          <Animated.View style={[styles.flame, flameAnimatedStyle]}>
            <Svg width={size * 0.3} height={size * 0.4} viewBox="0 0 30 40">
              <Defs>
                <RadialGradient id="flameGradientInner" cx="50%" cy="70%">
                  <Stop offset="0%" stopColor="#FFFF00" />
                  <Stop offset="30%" stopColor="#FF6600" />
                  <Stop offset="70%" stopColor="#FF0000" />
                  <Stop offset="100%" stopColor="#990000" />
                </RadialGradient>
              </Defs>
              <Path
                d="M 15 35 Q 10 30 10 22 Q 10 15 15 10 Q 18 8 20 12 Q 22 15 20 20 Q 25 18 25 25 Q 25 32 15 35 Z"
                fill="url(#flameGradientInner)"
                opacity="0.9"
              />
              {/* Inner flame */}
              <Path
                d="M 15 32 Q 12 28 12 23 Q 12 18 15 15 Q 17 13 18 16 Q 19 19 17 22 Q 20 20 20 24 Q 20 29 15 32 Z"
                fill="#FFFF99"
                opacity="0.8"
              />
            </Svg>
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  candleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flame: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  wickGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
