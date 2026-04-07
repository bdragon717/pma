/**
 * Member Regist
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { MemberRegistProps } from '@/src/utils/types';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
  userid: z.string()
           .min(1, { message: "사용자 ID를 입력하세요." }) // 최소 1글자 이상
           .refine((val) => val.trim() !== "", "사용자 ID를 입력하세요."), // 공백 체크
  password: z.string()
             .min(1, { message: "비밀번호를 입력하세요." }) // 최소 1글자 이상
             .refine((val) => val.trim() !== "", "비밀번호를 입력하세요."), // 공백 체크
  name: z.string()
         .min(1, { message: "이름을 입력하세요." }) // 최소 1글자 이상
         .refine((val) => val.trim() !== "", "이름을 입력하세요."), // 공백 체크
  telno: z.string()
          .min(1, { message: "전화번호를 입력하세요." }) // 최소 1글자 이상
          .refine((val) => val.trim() !== "", "전화번호를 입력하세요."), // 공백 체크             
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputSchema = z.infer<typeof inputSchema>;

const MemberRegist = (props: MemberRegistProps) => {
    // useForm에 스키마 주입 및 타입 설정
    const { control, handleSubmit, getValues, formState: { isValid, errors },} = useForm<InputSchema>({
      resolver: zodResolver(inputSchema),
      mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
      defaultValues: {
        userid: '',
        password: '',
        name: '',
        telno: '',        
      },
    });
    const { userSelectSql, userInsertSql } = useDatabase() as any; // SQL
    const { styles, colors } = useTheme();
    const inputRef = useRef<TextInput>(null); // 포커스 지정
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    // 사용자 정보 조회
    useEffect(() => {
      const userCheck = async () => {
        const row = await userSelectSql();
        if (row) {
          Alert.alert("알림", "이미 가입된 회원입니다.", [
            {
              text: "확인",
              onPress: () => {
                // 모달 닫기
                props.setRegistIsOpen?.(false);            
                // 로그인 화면으로 이동 (뒤로 가기 또는 루트로 이동)
                // if (router.canGoBack()) { // 현재 앱 내에서 뒤로 갈 수 있는 페이지 기록(History)이 있는지 확인
                //   router.back(); 
                // } else {
                //   router.replace('/(auth)/login'); // 명시적으로 로그인 경로 지정
                // }
                router.replace('/(auth)/login'); // 명시적으로 로그인 경로 지정
              }
            }
          ]);
        }
      }
      userCheck();
    }, []);

    // Member Regist
    const onSubmit = async (formData: InputSchema) => {
      const today = new Date();
      const offset = today.getTimezoneOffset() * 60000; // 시차 계산 (밀리초)
      const localDate = new Date(today.getTime() - offset); // 현지 시간으로 보정
      const ymd = localDate.toISOString().slice(0, 10); // 결과: "2024-05-22"
      //const ymd = localDate.toISOString().slice(0, 10).replace(/-/g, ""); // 결과: "20240522"  
      // 저장
      await userInsertSql(formData.userid, formData.password, formData.name, formData.telno, ymd, 0);
      props.setRegistIsOpen?.(false);
    };    

    // 실패 시 Error Message 함수
    const onInvalid = (errors: FieldErrors) => {
      // 특정 필드 에러 alert
      if (errors.userid) {
        Alert.alert("알림", errors.userid.message  as string);
      } else if (errors.password) {
        Alert.alert("알림", errors.password.message  as string);
      } else if (errors.name) {
        Alert.alert("알림", errors.name.message  as string);
      } else if (errors.telno) {
        Alert.alert("알림", errors.telno.message  as string);        
      } 
    };

    // ID 중복확인
    const handleDupCheck = async () => {
      // 현재 입력된 ID 값 가져오기
      const { userid } = getValues(); 
      // ID 입력 여부 확인
      if (!userid || userid.trim() === "") {
        Alert.alert("알림", "ID를 입력하세요.");
        inputRef.current?.focus(); // 입력창에 포커스 지정
        return;
      }
      // 사용자 정보 조회
      const row = await userSelectSql(userid, null, null);  
      // 사용자 정보 미존재
      if(row) {
          Alert.alert("알림", "이미 사용중인 ID 입니다.");
          inputRef.current?.focus(); // 입력창에 포커스 지정
      } else {
          Alert.alert("알림", "사용 가능한 ID 입니다.");
      }
    };

    return (
      <View style={styles.containerze}>
        {/* 입력 폼 */}                
        <View style={ styles.content }>
          <KeyboardAwareScrollView nestedScrollEnabled={true}>
            <View style={styles.serchsn}>
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
              <Button label="중복확인" 
                onPress={handleDupCheck} 
                //icon={"pencil"} 
                isFormValid={false} 
                widthSize={0.26} 
                heightSize={0.055}
                fontSize={14}/>
            </View>
            <View>
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

export default MemberRegist;