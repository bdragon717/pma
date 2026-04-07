/**
 * App Header
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import { appTitles } from '@/src/utils/screenTitles';
import { AppHeaderProps } from '@/src/utils/types';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import {
  Pressable,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 10; // 줄높이

const AppHeader = (props: AppHeaderProps) => {
  const { styles, colors } = useTheme();
  const router = useRouter();
  const segments = useSegments(); // 경로 배열
  const insets = useSafeAreaInsets(); // 현재 기기의 상(top), 하(bottom), 좌(left), 우(right) 안전 영역 수치(단위: 픽셀)를 가져오는 훅
  const topInset = props.applyInset ? insets.top : 0; // insets.top : 실제 상단 여백 값

  // 현재 화면명
  const current = segments[segments.length - 1]; // 배열의 가장 마지막 요소 - 현재 머물고 있는 화면의 이름(ID)
  //const title = appTitles[current] ?? ''; // appTitles라는 객체에서 현재 화면 이름(current)에 맞는 한글/영어 제목
  const title = props.title ?? (appTitles[current] ?? ''); // appTitles라는 객체에서 현재 화면 이름(current)에 맞는 한글/영어 제목  

  // 무조건 홈으로
  const handleBackPress = () => {
    router.push('/(tabs)');
  };

  return (    
    <View style={[styles.containerfh, {height: HEADER_HEIGHT + topInset}]}>
      {props.showBack && (
        <Pressable style={styles.left}
                   onPress={handleBackPress}          
                   hitSlop={10}
        >
          <Icon name="arrow-left" size={24} color={colors.black} />
        </Pressable>
      )}

      <View pointerEvents="none" style={styles.center}>
        <Text style={styles.title}>
          {title}
        </Text>
      </View>
    </View>
  );
};

export default AppHeader;