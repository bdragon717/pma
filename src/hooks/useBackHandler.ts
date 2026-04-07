/**
 * useBackHandler
 */

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';

export const useBackHandler = () => {
  // useFocusEffect 훅을 사용하여 화면 포커스 상태에 따라 로직을 실행
  useFocusEffect(
    useCallback(() => {
      // 화면이 포커스될 때마다 실행될 함수
      const backAction = () => {
        Alert.alert('앱 종료', '앱을 종료하시겠습니까?', [
          { text: '취소', onPress: () => null, style: 'cancel' },
          { text: '확인', onPress: () => BackHandler.exitApp() },
        ]);
        return true; // 뒤로가기 이벤트 처리를 했음을 알림
      };

      // 하드웨어 뒤로가기 버튼 이벤트 리스너를 추가
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      // 화면이 포커스를 잃거나 컴포넌트가 언마운트될 때 실행될 정리 함수
      return () => backHandler.remove(); // 이벤트 리스너를 제거
    }, [])
  );
};
