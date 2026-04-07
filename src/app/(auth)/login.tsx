/**
 * Login Screen
 */

import Button from '@/src/components/Button';
import IdSerchView from '@/src/components/IdSerchView';
import PwSerchView from '@/src/components/PwSerchView';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useBackHandler } from '@/src/hooks/useBackHandler';
import ScreenHeader from '@/src/layouts/ScreenHeader';
import ScreenLayout from '@/src/layouts/ScreenLayout';
import MemberRegist from '@/src/screens/MemberRegist';
import PasswordRegist from '@/src/screens/PasswordRegist';
import { useUserStore } from '@/src/store/useUserStore'; // Zustand 전역 상태
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const loginSchema = z.object({        
  id: z.string().catch(''), 
  password: z.string().catch(''),           
});

// 스키마를 통해 TypeScript 타입 자동 추출
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  // useForm에 스키마 주입 및 타입 설정
  const { control, handleSubmit, reset, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
    defaultValues: {
      id: '',
      password: '',
    },
  });
  const router = useRouter();
  const { styles, colors } = useTheme(); 
  const { width, height } = useWindowDimensions();  
  const idinputRef = useRef<TextInput>(null); // ID 포커스 지정
  const pwinputRef = useRef<TextInput>(null); // PW 포커스 지정
  const { userSelectSql, userUpdateSql } = useDatabase() as any; // SQL
  const login = useUserStore((state) => state.login); // Zustand 저장소에서 가져오기
  const [registIsOpen, setRegistIsOpen] = useState(false); // 회원가입 Modal Popup
  const [pwRegistIsOpen, setPwRegistIsOpen] = useState(false); // 비밀번호 초기화 Modal Popup
  const [idIsOpen, setIdIsOpen] = useState(false); // ID Modal Open
  const [pwIsOpen, setPwIsOpen] = useState(false); // Password Modal Open
  const colorScheme = useColorScheme();
  
  const backgroundColor = colorScheme === 'dark' ? colors.black : colors.white;

  // 종료여부 
  useBackHandler();

  // 로그인
  // auth Exist Check
  const onSubmit = async (data: LoginFormValues) => {
    // 사용자 정보 조회
    const row = await userSelectSql();  
    // 사용자 정보 미존재
    if( ! row) {
        Alert.alert("알림", "사용자 정보가 없습니다. 회원가입 해주세요.");
        return;
    }
    // ID & Password 일치 여부
    if (row.userid !== data.id || row.password !== data.password) { // 미일치
      // ID 일치 여부
      if (row.userid !== data.id) {
        Alert.alert("알림", "ID가 일치하지 않습니다. 확인 후 다시 입력해주세요.");
        reset({
          ...data, // 현재 입력된 값들(PW 포함)을 유지하고
          id: '',  // 아이디만 빈 값으로 덮어씌움
        });
        idinputRef.current?.focus(); // 입력창에 포커스 지정
      // Password 일치 여부
      } else if (row.password !== data.password) {
        const newErrorCount = (row.errorcount || 0) + 1; // 기존 오류 횟수에 1 추가
        Alert.alert("알림", `비밀번호 ${newErrorCount}회 오류 입니다. 5회 이상 오류시 초기화 해야 합니다.`);      
        // Auth 수정
        await userUpdateSql(row.userid, row.name, row.telno, null, null, newErrorCount);
        // 초기화 화면 호출
        if (newErrorCount >= 5) {
          Alert.alert("알림", "비밀번호 오류 5회 이상입니다. 초기화 화면으로 이동합니다.");          
          setPwRegistIsOpen(true); // 비밀번호 초기화 Modal Open
        } else {
          reset({
            ...data,       // 현재 입력된 값들(ID 포함)을 유지하고
            password: '',  // 비밀번호만 빈 값으로 덮어씌움
          });
          pwinputRef.current?.focus(); // 입력창에 포커스 지정
        }
      }
    } else { // 일치
      // 로그인 성공
      // Auth 수정
      await userUpdateSql(row.userid, row.name, row.telno, null, null, 0);      
      // 사용자 정보 Zustand 저장소에 저장
      login({userid: row.userid, password: row.password, name: row.name, telno: row.telno, changepwdate: row.changepwdate});
      // 메인 tabs 메뉴로 이동
      router.replace('/(tabs)'); 
    }
  };  

  // ID 찾기
  const handleIdSerch = () => {     
    setIdIsOpen(true); // ID 찾기 Modal Open
    setPwIsOpen(false);
  };

  // 비밀번호 찾기
  const handlePwSerch = () => {     
    setPwIsOpen(true); // 비밀번호 찾기 Modal Open
    setIdIsOpen(false);
  };

  // 회원가입
  const handleMemberRegist = () => {     
    setRegistIsOpen(true); // 회원가입 Modal Open
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerTitle}>
        <Text style={styles.headerTextsn}>Personal Management</Text>
      </View>
      <View style={styles.logheader}>
        <Text style={styles.logtext}>로그인</Text>
      </View>
      <View style={styles.loginput}>
        <Controller
          control={control}
          name="id"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, {width: width*0.70, height: height*0.05}]}           
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="ID"
              placeholderTextColor="gray"                     
              autoCapitalize="none"
              ref={idinputRef} // 입력창에 ref 연결 
            />
         )}
        />
        {errors.id && <Text style={styles.errorText}>{errors.id.message}</Text>}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, {width: width*0.70, height: height*0.05} ]}           
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="비밀번호"                
              placeholderTextColor="gray" 
              autoCapitalize="none" // 첫 글자가 대문자로 자동 변환되는 것을 방지              
              secureTextEntry={true} // 입력한 텍스트를 마스킹(●) 처리
              autoCorrect={false} // 입력 자동 수정 기능 비활성화
              textContentType="password" // iOS에서 키체인 연동을 도와줌
              ref={pwinputRef} // 입력창에 ref 연결
            />
         )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
      </View>
      <View style={styles.serchsn}>
        <Button label="로그인" 
                onPress={handleSubmit(onSubmit)} 
                //icon={"pencil"} 
                isFormValid={false} 
                widthSize={0.33} 
                heightSize={0.055}
                fontSize={14}/>
        <Button label="회원가입" 
                onPress={handleMemberRegist} 
                //icon={"pencil"} 
                isFormValid={false} 
                widthSize={0.33} 
                heightSize={0.055}
                fontSize={14}/>
      </View>
      <View style={styles.serchsn}>
        <Pressable onPress={() => handleIdSerch()}
                   style={({ pressed }) => [styles.rowst, pressed && {backgroundColor: colors.gray}]}
        > 
          <Text style={styles.subText}> 
            ID찾기
          </Text>
        </Pressable>
        <Pressable onPress={() => handlePwSerch()}
                   style={({ pressed }) => [styles.rowst, pressed && {backgroundColor: colors.gray}]}
        > 
          <Text style={styles.subText}> 
            비밀번호찾기
          </Text>
        </Pressable>
      </View>
      <View style={styles.subTitle}>
        <Text style={styles.subTextst}>COPYRIGHT ⓒ AN BYUNG YONG ALL RIGHT RESERVED</Text>
      </View>
      {/* 회원가입 */}
      <View>          
        <Modal visible={registIsOpen} 
               onRequestClose={() => {setRegistIsOpen(false);}} // 모달 닫기 요청 처리 : 뒤로가기등
               animationType='none'
               transparent={false}
        >
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor}} 
                        edges={['top', 'bottom']}>
            <ScreenLayout 
              header={<ScreenHeader title={"회원가입"} applyInset={true}/>} 
            >      
              <MemberRegist setRegistIsOpen={setRegistIsOpen} />
            </ScreenLayout>  
          </SafeAreaView>         
        </Modal>
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
              <PasswordRegist setPwRegistIsOpen={setPwRegistIsOpen}/>
            </ScreenLayout>  
          </SafeAreaView>         
        </Modal>
      </View>
      {/* ID찾기 Modal Open */}
      <View>         
        <Modal visible={idIsOpen}
               onRequestClose={() => setIdIsOpen(false)}
               animationType="fade" // 슬라이드보다 페이드가 팝업 느낌에 더 적합
               transparent={true}
        >
          <View style={styles.modalOverlay}>{/* 배경 레이어: 화면 전체를 반투명하게 덮음 */}  
            <View style={[styles.modalContent, {width: '80%', height: '40%'}]}>{/* 실제 팝업 컨텐츠: 중앙에 작게 위치 */}
              <IdSerchView setIdIsOpen={setIdIsOpen} />
            </View>
          </View>
        </Modal>        
      </View>
      {/* 비밀번호찾기 Modal Open */}
      <View>         
        <Modal visible={pwIsOpen}
               onRequestClose={() => setPwIsOpen(false)}
               animationType="fade" // 슬라이드보다 페이드가 팝업 느낌에 더 적합
               transparent={true}
        >
          <View style={styles.modalOverlay}>{/* 배경 레이어: 화면 전체를 반투명하게 덮음 */}  
            <View style={[styles.modalContent, {width: '80%', height: '50%'}]}>{/* 실제 팝업 컨텐츠: 중앙에 작게 위치 */}
              <PwSerchView setPwIsOpen={setPwIsOpen} />
            </View>
          </View>
        </Modal>        
      </View>
    </View>
  );
}