/**
 * Auth Check
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { AuthCheckProp } from '@/src/utils/types';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import 'react-native-get-random-values';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const inputSchema = z.object({
  authkey: z.string()
             .min(1, { message: "인증키를 입력하세요." }) // 최소 1글자 이상
             .refine((val) => val.trim() !== "", "인증키를 입력하세요."), // 공백 체크         
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputSchema = z.infer<typeof inputSchema>;

const AuthCheck = (props: AuthCheckProp) => {
    const { authSelectSql, authUpdateSql } = useDatabase() as any; // SQL
    const { width, height } = useWindowDimensions();
    const { styles, colors } = useTheme();
    const inputRef = useRef<TextInput>(null); // 포커스 지정
    const router = useRouter(); // 경로 
    const [showPassword, setShowPassword] = useState(false);

    // useForm에 스키마 주입 및 타입 설정
    const { control, handleSubmit, resetField, formState: { isValid, errors },} = useForm<InputSchema>({
      resolver: zodResolver(inputSchema),
      mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
      defaultValues: {
        authkey: '',
      },
    });

    // auth Exist Check
    const onSubmit = async (data: InputSchema) => {
      // Auth 체크
      //const row = await authCheckSql(data.authkey); // Auth is Exist 확인
      //if (row.isExist === 0) { // 미일치
      const row = await authSelectSql(); // Auth 확인      
      if (row.authkey !== data.authkey) { // 미일치
        const newErrorCount = (row.errorcount || 0) + 1; // 기존 오류 횟수에 1 추가
        Alert.alert("알림", `인증키 ${newErrorCount}회 오류 입니다. 5회 이상 오류시 초기화 해야 합니다.`);        
        // Auth 수정
        await authUpdateSql(null, newErrorCount);
        // 초기화 화면 호출
        if (newErrorCount >= 5) {
          Alert.alert("알림", "인증키 오류 5회 이상입니다. 초기화 화면으로 이동합니다.");
          handleOpenRegist();
        } else {
          resetField("authkey");
          inputRef.current?.focus(); // 입력창에 포커스 지정
        }
      } else { // 일치
        // Auth 수정
        await authUpdateSql(null, 0);
        props.setAuth(true);
        props.setAuthCheckIsOpen(false); // AuthCheck 종료
      }
    };

    // 변경 화면 호출 함수
    const handleOpenRegist = () => {
      router.push({
        pathname: '/authRegist', // (modals) 폴더 안의 파일명
        params: { 
          registFlag: "Change" // 상세 데이터 전달
        }
      });
    };

    // 실패 시 Error Message 함수
    const onInvalid = (errors: FieldErrors) => {
      // 특정 필드 에러 alert
      if (errors.authkey) {
        Alert.alert("알림", errors.authkey.message  as string);
      } else {
        // 필드 상관없이 첫 번째 에러 메시지 띄우기
        const errorMessages = Object.values(errors);
        if (errorMessages.length > 0) Alert.alert("알림", errorMessages[0]?.message  as string);
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.headerst}>
          <Text style={styles.headerTextst}>인증 확인</Text>
        </View>
        <View style={styles.content}>
          <Controller
             control={control}
             name="authkey"
             render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.serchsn}>
                <TextInput
                  style={[styles.titleInput, {width: width*0.60, height: height*0.05} ]}           
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="인증키"                
                  placeholderTextColor="gray" 
                  autoCapitalize="none" // 첫 글자가 대문자로 자동 변환되는 것을 방지
                  ref={inputRef} // 입력창에 ref 연결 
                  secureTextEntry={!showPassword} // 입력한 텍스트를 마스킹(●) 처리
                  autoCorrect={false} // 입력 자동 수정 기능 비활성화
                  textContentType="password" // iOS에서 키체인 연동을 도와줌
                />
                <Pressable onPress={() => setShowPassword(prev => !prev)} >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={24} color={colors.darkGray}/>
                </Pressable>
              </View>              
             )}             
          />          
          {errors.authkey && <Text style={styles.errorText}>{errors.authkey.message}</Text>}                    
          <Pressable onPress={() => handleOpenRegist()}
                     style={({ pressed }) => [styles.rowst, pressed && {backgroundColor: colors.gray}]}
          > 
            <Text style={styles.subText}> 
              초기화
            </Text>
          </Pressable>          
        </View>
        <View style={styles.serchsn}>
          <Button label="취소" 
                  onPress={() => props.setAuthCheckIsOpen(false)} 
                  //icon={"cancel"} 
                  isFormValid={false} 
                  widthSize={0.20} 
                  heightSize={0.055}
                  fontSize={14}/>
          <Button label="확인" 
                  onPress={handleSubmit(onSubmit, onInvalid)} 
                  //icon={"content-save"} 
                  isFormValid={!isValid} 
                  widthSize={0.20} 
                  heightSize={0.055}
                  fontSize={14}/>
        </View>
      </View>
    );
}

export default AuthCheck;