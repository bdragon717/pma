/**
 * Splash Screen
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';

const SplashScreen = () => {
  const router = useRouter(); // useRouter 훅을 사용해 라우터 객체를 얻습니다.
  const { styles } = useTheme();

  // useRouter를 사용하여 다른 페이지로 이동할 수 있습니다.  
  useEffect(() => {
    const timer = setTimeout(() => {router.replace("../index")}, 3000); // 3초 후 홈 화면으로 이동
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.containeret}>
      <Image
        source={require('@/assets/images/20250930_170046.png')} // 이미지 경로 지정
        style={{ width: 100, height: 100 }} // 이미지 크기 지정
      />
      <Text style={styles.textsd}>
        시작하는 중..
      </Text>
    </View>
  );
};

export default SplashScreen;
