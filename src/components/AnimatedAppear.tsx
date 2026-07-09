import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

type AnimatedAppearProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
};

export function AnimatedAppear({ children, delay = 0, distance = 14 }: AnimatedAppearProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        damping: 18,
        stiffness: 120,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}
