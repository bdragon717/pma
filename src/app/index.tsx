import { useTheme } from '@/src/contexts/ThemeContext';
import { useUserStore } from '@/src/store/useUserStore'; // Zustand 전역 상태
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const isHydrated = useUserStore((state) => state.isHydrated);
  const setPasswordExpired = useUserStore((state) => state.setPasswordExpired);
  const user = useUserStore((state) => state.user);
  const { styles } = useTheme(); 

  useEffect(() => {
    if ( ! isHydrated) return;
    
    // 앱 부팅 전용 분기 - 앱 시작 시 자동 분기
    if (isLoggedIn) {
      // 비밀번호 만료 여부 체크
      if (user?.changepwdate) {
        // 비밀번호 만료 여부 체크 + 3개월
        const changeDate = new Date(user.changepwdate); // 날짜 객체로 변환        
        changeDate.setMonth(changeDate.getMonth() + 3); // 3개월 후 날짜 계산 

        // 시간 정보를 제거하고 '날짜'만 비교
        const today = new Date();
        today.setHours(0, 0, 0, 0);         
        changeDate.setHours(0, 0, 0, 0);

        // 현재 날짜가 3개월 후 날짜보다 크면 비밀번호 만료 상태로 설정
        if (today >= changeDate) {          
          setPasswordExpired(true); // 비밀번호 만료 여부 설정
        }
      }
      router.replace('/(tabs)'); // 로그인 상태면 메인 화면으로 이동
    } else {
      router.replace('/(auth)/login'); // 로그인 상태가 아니면 로그인 화면으로 이동
    }
  }, [isLoggedIn, isHydrated]);

  return (
    <View style={styles.log}>
      {<ActivityIndicator size="large" /> /* 로딩 애니메이션(스피너) 아이콘을 표시 */}
    </View>
  );
}