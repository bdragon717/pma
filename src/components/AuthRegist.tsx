/**
 * Auth Regist
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuthStore } from '@/src/store/useAuthStore'; // Zustand 전역 상태
import { useUserStore } from '@/src/store/useUserStore'; // Zustand 전역 상태
import { AuthRegistProp } from '@/src/utils/types';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, FieldErrors, useForm, useWatch } from 'react-hook-form';
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
  authkey: z.string()
            .min(1, { message: "인증키를 입력하세요." }) // 최소 1글자 이상
            .refine((val) => val.trim() !== "", "인증키를 입력하세요."), // 공백 체크         
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputSchema = z.infer<typeof inputSchema>;

const AuthRegist = (props: AuthRegistProp) => {
    const { authInsertSql, authUpdateSql } = useDatabase() as any; // SQL
    const { styles, colors } = useTheme();
    const inputRef = useRef<TextInput>(null); // 포커스 지정
    const setAuth = useAuthStore((state) => state.setAuth); // Zustand 저장소에서 가져오기
    const router = useRouter(); // 경로
    const [showPassword, setShowPassword] = useState(false);
    const user = useUserStore((state) => state.user);
    
    // 기존 스키마에서 authkey만 추출한 스키마 생성
    const registSchema = inputSchema.pick({ authkey: true });

    // 현재 모드에 맞는 스키마를 결정.
    const currentSchema = props.registFlag === "Regist" ? registSchema : inputSchema;

    // useForm에 스키마 주입 및 타입 설정
    const { control, handleSubmit, reset, formState: { isValid, errors },} = useForm<InputSchema>({
      resolver: zodResolver(currentSchema) as any, 
      mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
      defaultValues: {
        name: '',
        telno: '',
        authkey: '',
      },
    });

    // Auth Regist
    const onSubmit = async (data: InputSchema) => {
      if (props.registFlag === "Regist") { // 등록
        // Auth 등록
        await authInsertSql(data.authkey);
        setAuth(true); // Zustand 전역 상태 업데이트
        router.back(); // 페이지 이동 방식이므로 back()으로 모달을 닫음
      } else if (props.registFlag === "Change") { // 변경
        // 본인 Check
        if (user?.name !== data.name || user?.telno !== data.telno) { // 미일치
          Alert.alert("알림", "이름 또는 전화번호가 틀립니다. 확인후 정확히 입력하세요.");
          reset();
          inputRef.current?.focus(); // 입력창에 포커스 지정
        } else { // 일치
          // Auth 수정
          await authUpdateSql(data.authkey, 0);
          setAuth(true); // Zustand 전역 상태 업데이트
          router.back(); // 페이지 이동 방식이므로 back()으로 모달을 닫음
        }
      }
    };

    // useWatch로 authkey 값을 실시간 감시
    const authkey = useWatch({
      control,
      name: "authkey", // 감시할 필드 이름
      defaultValue: "" // 초기값
    });

    // 입력 유효성 검사 함수
    const isValidCheck = () => {
      if (props.registFlag === "Regist") {
        return ! authkey; // authkey가 있으면(참) false 반환 -> 버튼 활성
      } else {
        return ! isValid;
      }
    };

    // 실패 시 Error Message 함수
    const onInvalid = (errors: FieldErrors) => {
      // 특정 필드 에러 alert
      if (props.registFlag === "Change") {
        if (errors.name) {
          Alert.alert("알림", errors.name.message  as string);
        } else if (errors.telno) {
          Alert.alert("알림", errors.telno.message  as string); 
        }
      }             
      if (errors.authkey) {
        Alert.alert("알림", errors.authkey.message  as string); 
      }
    };

    return (
      <View style={styles.containerze}>
        {/* 입력 폼 */}                
        <View style={ styles.content }>
          <KeyboardAwareScrollView nestedScrollEnabled={true}>
            <View>
              {props.registFlag === "Change" && (
                <>                
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
                      ref={inputRef} // 입력창에 ref 연결
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
                </>
              )}              
              <Controller
                control={control}
                name="authkey"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.serchsn}>
                    <TextInput
                      style={styles.contentsInput}          
                      value={value}
                      onChangeText={onChange}
                      textAlignVertical='top' // android에서 입력 시작 위치가 위쪽에 오도록
                      scrollEnabled={true} // 입력창 안에서 스크롤 가능
                      onBlur={onBlur}
                      placeholder="인증키"
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
              {errors.authkey && <Text style={styles.errorText}>{errors.authkey.message}</Text>}              
            </View>             
          </KeyboardAwareScrollView>
        </View>
        {/* 버튼 */}
        <View>
          <KeyboardToolbar
            offset={{
              opened: 100, // 키보드가 열렸을 때 위치
              closed: 0   // 키보드가 닫혔을 때 위치
            }}
          >
            <KeyboardToolbar.Content>
              <View style={styles.buttonst}>
                <Button 
                  label="저장" 
                  onPress={handleSubmit(onSubmit, onInvalid)} 
                  isFormValid={!!isValidCheck()}
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

export default AuthRegist;