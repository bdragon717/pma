/**
 * Password Expire Banner
 */

import ScreenHeader from '@/src/layouts/ScreenHeader';
import ScreenLayout from '@/src/layouts/ScreenLayout';
import PasswordRegist from '@/src/screens/PasswordRegist';
import { useUserStore } from "@/src/store/useUserStore";
import { StatusBar } from 'expo-status-bar';
import React, { useState } from "react";
import { Modal, Pressable, Text, View, useColorScheme } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../contexts/ThemeContext";

export default function PasswordExpireBanner() {
  const { styles, colors } = useTheme();
  const passwordExpired = useUserStore((state) => state.passwordExpired);
  const hideExpireBannerToday = useUserStore((state) => state.hideExpireBannerToday);
  const hideBannerToday = useUserStore((state) => state.hideBannerToday);
  const postponePasswordChange = useUserStore((state) => state.postponePasswordChange);
  const [pwRegistIsOpen, setPwRegistIsOpen] = useState(false); // 비밀번호 초기화 Modal Popup
  const [isFlag, setIsFlag] = useState<string>(''); // Flag for some condition
  const colorScheme = useColorScheme();
    
    const backgroundColor = colorScheme === 'dark' ? colors.black : colors.white;

  // 비밀번호 만료 상태가 아니면 배너를 표시하지 않음, 3개월 미만이거나 '나중에'를 눌러 임시로 숨긴 경우
  if ( ! passwordExpired ) return null;

  // 오늘 하루 안보기 옵션이 설정되어 있고, 현재 시간이 유효기간보다 작으면 배너를 표시하지 않음
  if (hideExpireBannerToday && Date.now() < hideExpireBannerToday) {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerBox}>
        <Text style={styles.bannerBoxTitle}>
          비밀번호 변경 알림
        </Text>
        <Text style={styles.bannerTitlest}>
          비밀번호를 변경한 지 3개월이 지났습니다.{"\n"}보안을 위해 지금 변경해 주세요.
        </Text>
        <View style={styles.bannerContent}>
          <Pressable onPress={() => hideBannerToday()} 
                     style={styles.bannerButton}>
            <Text style={styles.bannerTextst}>오늘 안보기</Text>
          </Pressable>
          <Pressable onPress={() => postponePasswordChange()} 
                     style={styles.bannerButton}>
            <Text style={styles.bannerTextst}>나중에</Text>
          </Pressable>
          <Pressable onPress={() => {setPwRegistIsOpen(true);
                                     setIsFlag("banner"); // Flag for some condition
                                    }} 
                     style={styles.bannerButtonst}>
            <Text style={styles.bannerTextsn}>지금변경</Text>
          </Pressable>
        </View>
      </View>
      {/* 비밀번호 초기화 */}
      <View>          
        <Modal visible={pwRegistIsOpen} 
               onRequestClose={() => {setPwRegistIsOpen(false);}} // 모달 닫기 요청 처리 : 뒤로가기등
               animationType='none'
               transparent={false}
        >
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor}} 
                        edges={['top', 'bottom']}>
            <ScreenLayout 
              header={<ScreenHeader title={"비밀번호 초기화"} applyInset={true}/>} 
            >      
              <PasswordRegist setPwRegistIsOpen={setPwRegistIsOpen} 
                              isFlag={isFlag}/>
            </ScreenLayout> 
          </SafeAreaView>          
        </Modal>
      </View>
    </View>
  );
}