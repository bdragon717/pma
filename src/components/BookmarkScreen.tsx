/**
 * Book Mark Screen
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  BackHandler,
  Dimensions,
  Pressable,
  Text,
  View
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function BookmarkScreen({children,}: {children: React.ReactNode;}) {
  const router = useRouter();
  const { styles, colors } = useTheme();
  const { title } = useLocalSearchParams<{ title: string }>();

  // 시작 위치: 화면 오른쪽
  const translateX = useSharedValue(width);

  // 진입 애니메이션
  useEffect(() => {
    translateX.value = withTiming(0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  // Android 물리 Back 처리
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    shadowColor: colors.blackSt,
    shadowOpacity: 0.15,
    shadowRadius: 12,
  }));

  // '←' 클릭 시
  const handleBack = () => {
    translateX.value = withTiming(width, {
      duration: 260,
      easing: Easing.in(Easing.cubic),
    });
    setTimeout(() => {
      router.back();
    }, 260);
  };

  return (
    <Animated.View style={[styles.containerni, animatedStyle]}>
      {/* 헤더 */}
      <View style={styles.headerfh}>
        <Pressable onPress={handleBack} 
                   hitSlop={20}
                   style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Icon name="arrow-left" size={24} color={colors.black} />
        </Pressable>
        <View pointerEvents="none" style={styles.center}>
          <Text style={styles.titlest}>
            {title}
          </Text>
        </View>
      </View>

      {/* 내용 */}
      {children}
    </Animated.View>
  );
}