/**
 * AppStateResetHandler
 */

import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function AppStateResetHandler() {
  const appState = useRef(AppState.currentState);
  const router = useRouter(); // useNavigation 대신 useRouter 사용

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // 앱이 백그라운드에서 포그라운드로 전환될 때
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Expo Router의 replace 함수를 사용하여 스택을 초기화하고 'Splash' 화면으로 이동
        // useRouter의 replace 함수는 현재 스크린을 교체하여 내비게이션 스택의 기록을 남기지 않음
        router.replace("../index");
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [router]); // 의존성 배열에 router 추가

  return null;
}
