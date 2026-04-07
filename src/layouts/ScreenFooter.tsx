/**
 * Screen Footer
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import { ScreenFooterProps } from '@/src/utils/types';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FOOTER_HEIGHT = 10; // 줄높이

const ScreenFooter = (props: ScreenFooterProps) => {
  const { styles, colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets(); // 현재 기기의 상(top), 하(bottom), 좌(left), 우(right) 안전 영역 수치(단위: 픽셀)를 가져오는 훅
  const bottomInset = props.applyInset ? insets.bottom : 0; // insets.bottom : 실제 하단 여백 값

  const menus = [
    {
      label: '홈',
      icon: 'home-variant',
      path: '/(tabs)',
    },
    {
      label: '폴더',
      icon: 'folder-outline',
      path: '/(files)/fileMenu',
    },
    {
      label: '마이페이지',
      icon: 'account-outline',
      path: '/(mys)/myMenu',
    },
  ];

  return (
    <View style={[styles.containerth, {height: FOOTER_HEIGHT + bottomInset}]}>
      {menus.map(menu => {
        const isActive = pathname === menu.path || pathname.startsWith(menu.path + '/');

        return (
          <Pressable style={styles.itemth}
                     key={menu.path}
                     onPress={() => router.push(menu.path as any)}
          >
            <Icon name={menu.icon as any}
                  size={24}
                  color={isActive ? colors.silverGray : colors.black}
            />            
            <Text style={[styles.label, {color: isActive ? colors.silverGray : colors.black}]} >
              {menu.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default ScreenFooter;