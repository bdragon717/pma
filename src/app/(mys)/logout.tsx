/**
 * Logout Screen
 */

import Button from '@/src/components/Button';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useUserStore } from '@/src/store/useUserStore'; // Zustand 전역 상태
import { colors } from '@/src/utils/Theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Pressable,
  Text,
  View
} from 'react-native';

export default function LogoutScreen() {
  const router = useRouter();
  const logout = useUserStore((state) => state.logout); // Zustand 저장소에서 가져오기
  const { styles } = useTheme(); 
  const { title } = useLocalSearchParams<{ title: string }>();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
    // 뒤로가기 스택 제거
    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 0);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.headerfh}>
        <Pressable onPress={() => router.back()} 
                   hitSlop={20}
                   style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
           <Icon name="arrow-left" size={24} color={colors.black} />
        </Pressable>
          {/* Title */}
          <View style={styles.center}>
            <Text style={styles.titlest}>
              {title}
            </Text>
          </View>
      </View>
      {/* 버튼 */}
      <View style={styles.log}>
        <Button label="로그아웃" 
                onPress={handleLogout} 
                //icon={"pencil"} 
                isFormValid={false} 
                widthSize={0.50} 
                heightSize={0.055}
                fontSize={14}/>
      </View>
    </View>
  );
}