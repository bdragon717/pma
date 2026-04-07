import { AlarmRestoreManager } from '@/src/components/AlarmRestoreManager';
import { fetchAndCheckNotice } from '@/src/components/notice';
import NoticeModal from '@/src/components/NoticeModal';
import { DBProvider } from '@/src/contexts/SQLiteDBContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { useNoticeStore } from '@/src/store/useNoticeStore';
import { CheckForUpdate } from '@/src/utils/UpdateManagerGithub';
import * as Notifications from 'expo-notifications';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, useColorScheme, View } from 'react-native';
import 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// export const unstable_settings = {
//   anchor: '(tabs)', // 기본 루트
//   //initialRouteName: 'index', // 앱을 켰을 때 가장 먼저 보여줄 화면을 app/index.tsx로 강제. 
//                                // 만약 로그인 체크나 스플래시 화면을 index에서 처리하고 있다면 이 설정이 필요
// }; 

// 앱 시작 시 스플래시 화면 유지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isSplashHidden, setIsSplashHidden] = useState(false); 
  const colorScheme = useColorScheme();
  const hydrated = useNoticeStore((state) => state.hydrated);

  const backgroundColor = colorScheme === 'dark' ? '#000000' : '#ffffff';

  useEffect(() => {

    async function initializeApp() {
      try {
        // 업데이트 체크 실행
        await CheckForUpdate(false);

        // 알림 핸들러 설정 (앱 시작 시 1회)
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true, // iOS 17+
            shouldShowList: true,   // iOS 17+        
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        // 알림 권한 및 채널 설정, 권한 사전 요청 (전역 1회)
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          const res = await Notifications.requestPermissionsAsync();
          if (res.status !== 'granted') return;
        }

        // Android 알림 채널 설정
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('alarm-channel', {
            name: 'Alarm',
            importance: Notifications.AndroidImportance.MAX,
            sound: undefined, // 기본 알림음 사용
           });
         }
      } catch (error) {
        console.error("앱 초기화 중 오류 발생:", error);
        Alert.alert("초기화 오류", "데이터베이스를 준비하는 중 문제가 발생했습니다.");
      } finally {
        // 모든 초기화 작업(DB 연결 등 포함)이 끝나면 준비 완료
        setIsReady(true);
      }    
    }

     initializeApp();
  }, []);

  // 렌더 완료 후 Splash 제거 (딱 1번만)
  const onLayoutRootView = useCallback(async () => {
    if (isReady && hydrated && ! isSplashHidden) {
      setIsSplashHidden(true);
      await SplashScreen.hideAsync();
      // 서버 or 로컬에서 공지 가져오기    
      fetchAndCheckNotice(); // 준비 완료 후 공지사항 체크 (렌더링이 완료된 시점에서 1회 실행)
    }
  }, [isReady, hydrated, isSplashHidden]);

  // 준비 전까지 렌더 안함 (스플래시 유지)
  if ( ! isReady) return null;

  return (    
    <View
      style={{ flex: 1, backgroundColor }}
      onLayout={onLayoutRootView}
    >  
      <SafeAreaProvider>
        <ThemeProvider>
          <DBProvider>
            <AlarmRestoreManager />
              <KeyboardProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor }}>                
                <Stack screenOptions={{
                         headerShown: false,
                         contentStyle: { backgroundColor },
                         animation: 'none', // 기본 애니메이션 off
                }}>
                </Stack>                
                </SafeAreaView>     
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />           
            </KeyboardProvider>
          </DBProvider>   
        </ThemeProvider>
      </SafeAreaProvider>
      <NoticeModal />
    </View>
  );
};
