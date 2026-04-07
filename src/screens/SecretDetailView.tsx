/**
 * Secret Data Detail View
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { decrypt, encrypt } from "@/src/utils/cryptoUtil";
import { SecretDetailViewProps } from '@/src/utils/types';
//import { useRouter } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import {
  Alert,
  Text,
  TextInput,
  View
} from 'react-native';
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const inputSchema = z.object({
  contents: z.string()
             .min(1, { message: "contents를 입력하세요." }) // 최소 1글자 이상
             .refine((val) => val.trim() !== "", "contents를 입력하세요."), // 공백 체크
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputFormValues = z.infer<typeof inputSchema>;

const SecretDetailView = (props: SecretDetailViewProps) => {
  // useForm에 스키마 주입 및 타입 설정
  const { control, handleSubmit, reset, formState: { isValid, errors } } = useForm<InputFormValues>({
    resolver: zodResolver(inputSchema),
    mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
    defaultValues: {
      contents: '',
    },
  });

  const { styles, colors } = useTheme();
  const { pmmasterUpdateSql, pmmasterDeleteSql } = useDatabase() as any; // SQL
  const [isEditable, setIsEditable] = useState(false); // Update 활성/비활성화
  //const router = useRouter(); // 경로

  // 복호화
  useEffect(() => {
    const decryptData = async () => {
      if (props.contents) {
        const contentsDec = await decrypt(props.contents); // 복호화, await를 사용하여 Promise 안의 실제 string 값을 추출
        reset({ contents: contentsDec }); // 복호화된 값을 react-hook-form에 수동으로 넣어줌.
      }
    };

    decryptData();   
  }, [props.contents, reset]);

  // Secret Delete
  const handleDeleteData = async () => {
    Alert.alert(
      "삭제 확인", // 제목
      "정말로 이 항목을 삭제 하시겠습니까?", // 메시지
      [
        {
          text: "취소",
          style: "cancel" // iOS에서 굵은 글씨로 취소 강조
        },
        { 
          text: "삭제", 
          onPress: async () => {
            // 삭제
            await pmmasterDeleteSql(props.pmid); // 확인을 눌렀을 때만 실행되는 DB 삭제 로직   

            // 부모함수실행 : 탐색기 새로고침
            if (props.loadExplorer) {
              props.loadExplorer();
            }          
            // 닫기
            handleDetailView();
          },
          style: "destructive" // iOS에서 빨간색으로 위험 강조
        }
      ]
    );
  };  

  // Secret Update
  const onSubmit = async (data: InputFormValues) => { 
    // Secret Update
    if (isValid) {
      const contentsEnc = await encrypt(data.contents); // 암호화
      await pmmasterUpdateSql(props.pmid, null, contentsEnc, undefined);

      // 부모함수실행 : 탐색기 새로고침
      if (props.loadExplorer) {
        props.loadExplorer();
      }          
      // 닫기
      handleDetailView();
    }    
  };

  // 실패 시 Error Message 함수
  const onInvalid = (errors: FieldErrors) => {
    // 특정 필드 에러 alert
    if (errors.contents) {
      Alert.alert("알림", errors.contents.message  as string);
    } else {
      // 필드 상관없이 첫 번째 에러 메시지 띄우기
      const errorMessages = Object.values(errors);
      if (errorMessages.length > 0) Alert.alert("알림", errorMessages[0]?.message  as string);
      }
  };

  // Update 활성화 
  const handleUpdateData = () => {
    setIsEditable(true)
  };

  // 상세조회 PopUp Close
  const handleDetailView = () => {
    props.setDetailViewIsOpen?.(false);
    //router.back(); // 현재 모달 닫기
  };

  return (   
      <View style={styles.containerze}>
        {/* 버튼 */}
        <View style={styles.button}>
          <Button label="수정" 
                  onPress={handleUpdateData} 
                  //icon={"trash-can-outline"} 
                  isFormValid={false} 
                  widthSize={0.20} 
                  heightSize={0.055}
                  fontSize={14}/>
          <Button label="삭제" 
                  onPress={handleDeleteData} 
                  //icon={"trash-can-outline"} 
                  isFormValid={false} 
                  widthSize={0.20} 
                  heightSize={0.055}
                  fontSize={14}/>
          <Button label="닫기" 
                  onPress={handleDetailView} 
                  //icon={"door-closed"} 
                  isFormValid={false} 
                  widthSize={0.20} 
                  heightSize={0.055}
                  fontSize={14}/>
        </View>
        {/* 입력 */}        
        <View style={ styles.content }>
          <KeyboardAwareScrollView nestedScrollEnabled={true}>
            <Controller
              control={control}
              name="contents"
              //defaultValue={contents} // 부모에게 받은 초기값 셋팅
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.contentsInput, 
                    ! isEditable && { backgroundColor: colors.lightGraysx, 
                                      color: colors.black }, // 비활성화 시 시각적 효과
                    { maxHeight: isEditable ? 250 : 530 }
                  ]}           
                  value={value}
                  onChangeText={(text) => isEditable && onChange(text)}
                  onBlur={onBlur}
                  multiline={true}
                  textAlignVertical='top'
                  scrollEnabled={true}
                  autoCapitalize="none"
                  placeholderTextColor="gray"   
                  editable={true} // 활성화/비활성화 제어 핵심 속성
                  showSoftInputOnFocus={isEditable} // false면 터치해도 키보드가 안 올라옴
                  caretHidden={ ! isEditable}       // 커서(깜빡임)도 안 보이게 설정
                />
              )}
            />
            {errors.contents && <Text style={styles.errorText}>{errors.contents.message}</Text>}          
          </KeyboardAwareScrollView>
        </View>
        {/* 저장 */}        
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

export default SecretDetailView;