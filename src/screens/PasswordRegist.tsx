/**
 * Password Regist
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useUserStore } from '@/src/store/useUserStore'; // Zustand 전역 상태
import { PasswordRegistProps } from '@/src/utils/types';
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
  View
} from 'react-native';
import 'react-native-get-random-values';
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const inputSchema = z.object({
  name: z.string()
         .min(1, { message: "이름을 입력하세요." }) // 최소 1글자 이상
         .refine((val) => val.trim() !== "", "이름을 입력하세요."), // 공백 체크
  telno: z.string()
          .min(1, { message: "전화번호를 입력하세요." }) // 최소 1글자 이상
          .refine((val) => val.trim() !== "", "전화번호를 입력하세요."), // 공백 체크
  userid: z.string()
           .min(1, { message: "사용자 ID를 입력하세요." }) // 최소 1글자 이상
           .refine((val) => val.trim() !== "", "사용자 ID를 입력하세요."), // 공백 체크
  password: z.string()
             .min(1, { message: "비밀번호를 입력하세요." }) // 최소 1글자 이상
             .refine((val) => val.trim() !== "", "비밀번호를 입력하세요."), // 공백 체크           
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputSchema = z.infer<typeof inputSchema>;

const PasswordRegist = (props: PasswordRegistProps) => {
    // useForm에 스키마 주입 및 타입 설정
    const { control, handleSubmit, reset, formState: { isValid, errors },} = useForm<InputSchema>({
      resolver: zodResolver(inputSchema),
      mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
      defaultValues: {
        name: '',
        telno: '',
        userid: '',
        password: '',
      },
    });
    const { selfUserSelect, userUpdateSql } = useDatabase() as any; // SQL
    const { styles, colors } = useTheme();
    const inputRef = useRef<TextInput>(null); // 포커스 지정
    const router = useRouter(); // 경로
    const [showPassword, setShowPassword] = useState(false);
    const setPasswordExpired = useUserStore((state) => state.setPasswordExpired);
    const logout = useUserStore((state) => state.logout);
    
    // Auth Regist
    const onSubmit = async (formData: InputSchema) => {      
      // 본인 Check
      const row = await selfUserSelect(formData.userid, formData.name, formData.telno); // 본인 is Exist 확인
      if (row.isExist === 0) { // 미일치
        Alert.alert("알림", "ID 또는 이름, 전화번호가 틀립니다. 확인후 정확히 입력하세요.");
        reset();
        inputRef.current?.focus(); // 입력창에 포커스 지정
      } else { // 일치
        const today = new Date();
        const offset = today.getTimezoneOffset() * 60000; // 시차 계산 (밀리초)
        const localDate = new Date(today.getTime() - offset); // 현지 시간으로 보정
        const ymd = localDate.toISOString().slice(0, 10); // 결과: "2024-05-22"
        //const ymd = localDate.toISOString().slice(0, 10).replace(/-/g, ""); // 결과: "20240522"
        // Auth 수정
        await userUpdateSql(formData.userid, formData.name, formData.telno, formData.password, ymd, 0);
        if (props.isFlag === "banner") {
          setPasswordExpired(false); // 비밀번호 만료 여부 설정
          handleLogout(); // 로그아웃 처리 및 로그인 화면으로 이동
        }        
        props.setPwRegistIsOpen?.(false);
      }
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

    // 실패 시 Error Message 함수
    const onInvalid = (errors: FieldErrors) => {
      // 특정 필드 에러 alert
      if (errors.userid) {
        Alert.alert("알림", errors.userid.message  as string);
      } else if (errors.name) {
        Alert.alert("알림", errors.name.message  as string);
      } else if (errors.telno) {
        Alert.alert("알림", errors.telno.message  as string);        
      } else if (errors.password) {
        Alert.alert("알림", errors.password.message  as string);
      }
    };

    return (
      <View style={styles.containerze}>
        {/* 입력 폼 */}                
        <View style={ styles.content }>
          <KeyboardAwareScrollView nestedScrollEnabled={true}>
            <View>
              <Controller
                control={control}
                name="userid"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.contentsInput}          
                    value={value}
                    onChangeText={onChange}
                    textAlignVertical='top' // android에서 입력 시작 위치가 위쪽에 오도록
                    scrollEnabled={true} // 입력창 안에서 스크롤 가능
                    onBlur={onBlur}
                    placeholder="ID, 공백없이 입력"                    
                    placeholderTextColor="gray" 
                    autoCapitalize="none"
                    ref={inputRef} // 입력창에 ref 연결
                  />
                )}
              />
              {errors.userid && <Text style={styles.errorText}>{errors.userid.message}</Text>}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.contentsInput}          
                    value={value}
                    onChangeText={onChange}
                    textAlignVertical='top' // android에서 입력 시작 위치가 위쪽에 오도록
                    scrollEnabled={true} // 입력창 안에서 스크롤 가능
                    onBlur={onBlur}
                    placeholder="이름, 공백없이 입력"                    
                    placeholderTextColor="gray" 
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              <Controller
                control={control}
                name="telno"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.contentsInput}           
                    value={value}
                    onChangeText={onChange}
                    textAlignVertical='top' // android에서 입력 시작 위치가 위쪽에 오도록
                    scrollEnabled={true} // 입력창 안에서 스크롤 가능
                    onBlur={onBlur}
                    placeholder="전화번호, '-'없이 숫자만 입력"
                    placeholderTextColor="gray" 
                    autoCapitalize="none"                    
                  />
                )}
              />
              {errors.telno && <Text style={styles.errorText}>{errors.telno.message}</Text>}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.serchsn}>
                    <TextInput
                      style={styles.contentsInput}          
                      value={value}
                      onChangeText={onChange}
                      textAlignVertical='top' // android에서 입력 시작 위치가 위쪽에 오도록
                      scrollEnabled={true} // 입력창 안에서 스크롤 가능
                      onBlur={onBlur}
                      placeholder="비밀번호, 공백없이 입력"
                      placeholderTextColor="gray" 
                      autoCapitalize="none" // 첫 글자가 대문자로 자동 변환되는 것을 방지
                      secureTextEntry={!showPassword} // 입력한 텍스트를 마스킹(●) 처리
                      autoCorrect={false} // 자동 완성 추천을 끔
                      textContentType="password" // iOS에서 키체인 연동을 도와줌                    
                    />
                    <Pressable onPress={() => setShowPassword(prev => !prev)} >
                      <Icon name={showPassword ? "eye-off" : "eye"} size={24} color={colors.darkGray}/>
                    </Pressable>
                  </View>
                )}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}              
            </View>             
          </KeyboardAwareScrollView>
        </View>
        {/* 버튼 */}
        <View>
          <KeyboardToolbar
            offset={{
              opened: 40, // 키보드가 열렸을 때 위치
              closed: 0   // 키보드가 닫혔을 때 위치
            }}
          >
            <KeyboardToolbar.Content>
              <View style={styles.buttonst}>
                <Button 
                  label="저장" 
                  onPress={handleSubmit(onSubmit, onInvalid)} 
                  isFormValid={!isValid} 
                  widthSize={0.50} 
                  heightSize={0.055}
                  fontSize={14}
                />
              </View>
            </KeyboardToolbar.Content>
          </KeyboardToolbar>
        </View>        
      </View>
    );
}

export default PasswordRegist;