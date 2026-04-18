/**
 * My Info View
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useUserStore } from '@/src/store/useUserStore'; // Zustand 전역 상태
import { UserData } from '@/src/utils/types';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  Text,
  View
} from 'react-native';

const MyInfoView = () => {
  const { styles, colors } = useTheme();
  const { userSelectSql, userDeleteSql } = useDatabase() as any; // Insert SQL
  const [myinfo, setMyInfo] = useState<UserData>(); // 사용자 정보 Data
  const router = useRouter(); // 경로
  const { title } = useLocalSearchParams<{ title: string }>();
  const logout = useUserStore((state) => state.logout); // Zustand 저장소에서 가져오기

  // 사용자 정보 조회
  const handleFetchData = async () => {
    const row = await userSelectSql();
    setMyInfo(row);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  // My Info Secession
  const handleMemberSecession = async () => {
    Alert.alert(
          "회원탈퇴 확인", 
          `정말로 회원 탈퇴를 하시겠습니까?`,
          [
            { text: "취소", style: "cancel" },
            { text: "확인", 
              onPress: async () => {
                try {
                  // 사용자 정보 삭제
                  await userDeleteSql(myinfo?.userid);                  
                  Alert.alert("알림", "회원 탈퇴가 완료되었습니다.");
                  handleLogout(); // 로그아웃 처리 및 로그인 화면으로 이동
                } catch (error) {
                  console.error("삭제 중 오류:", error);
                  Alert.alert("오류", "회원 탈퇴 중 문제가 발생했습니다.");
                }
              } 
            }
          ]
        );
  };

  // Logout
  const handleLogout = () => {
    // Zustand 저장소에서 로그아웃 처리
    logout();
    // 로그인 화면 이동
    router.replace('/(auth)/login');
    // 뒤로가기 스택 제거
    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 0);
  };  

  // 이름 마스킹
  const maskName = (name: string | null | undefined) => {
    if ( ! name) return '';

    const len = name.length;
    
    if (len < 2) return name;
    if (len === 2) return name[0] + "*";
    
    // 첫 글자와 마지막 글자 사이를 모두 별표 처리
    return name[0] + "*".repeat(len - 2) + name.slice(-1);
  }

  // 전화번호 마스킹
  const maskPhoneNumber = (phone: string | null | undefined) => {
    if ( ! phone) return '';
  
    // 하이픈이 있는 경우 (010-1234-5678 -> 010-****-5678)
    if (phone.includes("-")) {
      const parts = phone.split("-"); // 하이픈 기준으로 자름
      if (parts.length === 3) {
        return `${parts[0]}-${"*".repeat(parts[1].length)}-${parts[2]}`;
      }
    }
  
    // 하이픈이 없는 경우 (01012345678 -> 010****5678)
    return phone.replace(/^(\d{3})(\d{3,4})(\d{4})$/, (match, p1, p2, p3) => {
      return `${p1}${"*".repeat(p2.length)}${p3}`;
    });
  };

  return (
      <View style={styles.containerze}>
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
        <View style={styles.button}>          
          <Button label="회원탈퇴" 
                  onPress={handleMemberSecession} 
                  //icon={"door-closed"} 
                  isFormValid={false} 
                  widthSize={0.30} 
                  heightSize={0.055}
                  fontSize={14}/>
          <Button label="로그아웃" 
                  onPress={handleLogout} 
                  //icon={"pencil"} 
                  isFormValid={false} 
                  widthSize={0.30} 
                  heightSize={0.055}
                  fontSize={14}/>
        </View>
        {/* 내용 */}
        <View style={styles.content}>
          <Text style={styles.textft}>
            이름{"\n"} 
            {maskName(myinfo?.name)}
          </Text>
          <Text style={styles.textft}>
            전화번호{"\n"} 
            {maskPhoneNumber(myinfo?.telno)}
          </Text>
          <Text style={styles.textft}>
            비밀번호 변경일자{"\n"} 
            {myinfo?.changepwdate}
          </Text>
        </View>          
      </View>
  );
}

export default MyInfoView;