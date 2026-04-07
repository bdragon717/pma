/**
 * AppStateReloadHandler
 */

import * as Updates from 'expo-updates';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function AppStateReloadHandler() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // 앱이 'inactive' 또는 'background' 상태에서 'active' 상태로 전환될 때
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Expo에서는 `Updates.reloadAsync()`를 사용하여 앱을 재시작
        handleReload();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Updates.reloadAsync()를 호출하는 함수
  const handleReload = async () => {
    // 개발 환경에서는 Updates.reloadAsync()가 예상대로 작동하지 않을 수 있음
    // 운영 환경에서만 재시작하도록 분기 처리하는 것이 좋음
    if (!__DEV__) { // 운영
      try {
        await Updates.reloadAsync();
      } catch (e) {
        console.error('Failed to reload app:', e);
      }
    } else { // 개발
      console.warn('Updates.reloadAsync()는 개발 모드에서 지원되지 않습니다.');
    }
  };

  return null;
}
