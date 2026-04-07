/**
 * Secret Data Regist
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { encrypt } from "@/src/utils/cryptoUtil";
import { SecretRegistProps } from '@/src/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
//import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import {
  Alert,
  Text,
  TextInput,
  View
} from 'react-native';
import 'react-native-get-random-values';
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const inputSchema = z.object({
  title: z.string()
          .min(1, { message: "title를 입력하세요." }) // 최소 1글자 이상
          .refine((val) => val.trim() !== "", "title를 입력하세요."), // 공백 체크
  contents: z.string()
             .min(1, { message: "contents를 입력하세요." }) // 최소 1글자 이상
             .refine((val) => val.trim() !== "", "contents를 입력하세요."), // 공백 체크
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputFormValues = z.infer<typeof inputSchema>;

const SecretRegist = (props: SecretRegistProps) => {
    // useForm에 스키마 주입 및 타입 설정
    const { control, handleSubmit, formState: { isValid, errors } } = useForm<InputFormValues>({
      resolver: zodResolver(inputSchema),
      mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
      defaultValues: {
        title: '',
        contents: '',
      },
    });

    const { pmmasterInsertSql } = useDatabase() as any; // Insert SQL
    const { styles } = useTheme();
    //const router = useRouter(); // 경로    

    // DB 등록
    const onSubmit = async (data: InputFormValues) => { 
      // 년월일 셋팅
      const today = new Date();
      const year = today.getFullYear().toString();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      // ID 생성
      const newId = uuidv4();
      // Secret Insert
      if (isValid) {
        const contentsEnc = await encrypt(data.contents); // 암호화
        await pmmasterInsertSql(newId, 'P', year, month, day, data.title, contentsEnc, props.folderId);
      }
      // 닫기
      props.setRegistIsOpen?.(false);
      //router.back(); // 현재 모달 닫기
    };

    // 실패 시 Error Message 함수
    const onInvalid = (errors: FieldErrors) => {
      // 특정 필드 에러 alert
      if (errors.title) {
        Alert.alert("알림", errors.title.message  as string);
      } else if (errors.contents) {
        Alert.alert("알림", errors.contents.message  as string);
      } else {
        // 필드 상관없이 첫 번째 에러 메시지 띄우기
        const errorMessages = Object.values(errors);
        if (errorMessages.length > 0) Alert.alert("알림", errorMessages[0]?.message  as string);
        }
    };

    return (
      <View style={styles.containerze}>
        {/* 입력 폼 */}
        {/* KeyboardAwareScrollView : 사용자가 입력하려는 TextInput이 키보드에 가려지지 않도록 자동으로 스크롤해주는 기능 */}
        <View style={ styles.content }>
          <KeyboardAwareScrollView nestedScrollEnabled={true}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.titleInput}          
                  value={value}
                  onChangeText={onChange}
                  textAlignVertical='top' // android에서 입력 시작 위치가 위쪽에 오도록
                  scrollEnabled={true} // 입력창 안에서 스크롤 가능
                  onBlur={onBlur}
                  placeholder="제목"
                  autoCapitalize="none"
                  placeholderTextColor="gray" 
                />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
            <Controller
              control={control}
              name="contents"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.contentsInput, { maxHeight: 250 }]}           
                  value={value}
                  onChangeText={onChange}
                  multiline={true} // 키보드에 줄바꿈 나타남
                  textAlignVertical='top' // android에서 입력 시작 위치가 위쪽에 오도록
                  scrollEnabled={true} // 입력창 안에서 스크롤 가능
                  onBlur={onBlur}
                  placeholder="내용"
                  autoCapitalize="none"
                  placeholderTextColor="gray"
                />
              )}
            />
            {errors.contents && <Text style={styles.errorText}>{errors.contents.message}</Text>}          
          </KeyboardAwareScrollView>
        </View>
        {/* 버튼 */}
        {/* KeyboardToolbar : 키보드가 나타날 때, **키보드 위에 항상 고정되어 표시되는 추가적인 UI(버튼등)**를 만들 수 있게 해줌 */}
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

export default SecretRegist;