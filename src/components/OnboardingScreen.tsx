/**
 * Onboarding Screen
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Text,
  View
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

 const OnboardingScreen = () => {
    const router = useRouter(); // useRouter 훅을 사용해 라우터 객체를 얻습니다. 
    const { styles } = useTheme();

    // Gesture.Pan(): 패닝(드래그) 제스처를 생성
    const panGesture = Gesture.Pan()
         .onEnd((event) => { // 스와이프가 끝났을 때(손가락을 뗐을 때) 실행되는 콜백 함수를 정의            
            if (event.translationX > 50) { // 오른쪽으로 50 이상 스와이프했을 때
              router.replace("../Main"); // 스와프시 홈 화면으로 전환
            }            
            else if (event.translationX < -50) { // 왼쪽으로 50 이상 스와이프했을 때
              router.replace("../Main"); // 스와프시 홈 화면으로 전환
            }
    });

    // GestureHandlerRootView : 앱의 최상위 또는 루트 컴포넌트에서 제스처 핸들러를 사용하도록 초기화하는 역할 
    // GestureDetector : panGesture라는 제스처 정의를 전달받음, 이 컴포넌트의 자식 영역에서 발생하는 터치 이벤트를 감지 
    return (        
        <GestureHandlerRootView style={styles.containeret}>
          <GestureDetector gesture={panGesture}>
            <View style={styles.containeret}>
                <Image
                  source={require('@/assets/images/favicon.png')} // 이미지 경로 지정
                  style={{ width: 100, height: 100 }} // 이미지 크기 지정
                />
                <Text style={styles.textsn}>
                  좌우로 밀어서 시작하세요.
                </Text>
            </View>
          </GestureDetector>
        </GestureHandlerRootView>
    )
};

export default OnboardingScreen;