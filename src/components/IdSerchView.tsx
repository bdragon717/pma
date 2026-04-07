/**
 * ID 찾기 Modal
 */

import Button from '@/src/components/Button';
import { useTheme } from '@/src/contexts/ThemeContext';
import { IdSearchViewProps } from '@/src/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef, useState } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import {
  Alert,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import { z } from 'zod'; // 유효성 검사
import { useDatabase } from '../contexts/SQLiteDBContext';

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const inputSchema = z.object({
  name: z.string()
         .min(1, { message: "이름을 입력하세요." }) // 최소 1글자 이상
         .refine((val) => val.trim() !== "", "이름을 입력하세요."), // 공백 체크
  telno: z.string()
          .min(1, { message: "전화번호를 입력하세요." }) // 최소 1글자 이상
          .refine((val) => val.trim() !== "", "전화번호를 입력하세요."), // 공백 체크
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputFormValues = z.infer<typeof inputSchema>;

const IdSerchView = (props: IdSearchViewProps) => {
  // useForm에 스키마 주입 및 타입 설정
  const { control, handleSubmit, formState: { errors },} = useForm<InputFormValues>({
    resolver: zodResolver(inputSchema),
    mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
    defaultValues: {
      name: '',
      telno: '',
    },
  });
  const { styles } = useTheme();
  const { userSelectSql } = useDatabase() as any; // SQL
  const [id, setId] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null); // 포커스 지정
  const { width, height } = useWindowDimensions();

  // contactName에 포함된 모든 전화번호 찿기
  const onSubmit = async (formData: InputFormValues) => {
    // ID 찾기
    const row = await userSelectSql(null, formData.name, formData.telno);
    if (row) {
      setId(row.userid);
    } else {
      setId(null);
      Alert.alert("알림", "일치하는 사용자 정보가 없습니다.");
      inputRef.current?.focus(); // 입력창에 포커스 지정
    }
  };

  // 실패 시 Error Message 함수
  const onInvalid = (errors: FieldErrors) => {
    // 특정 필드 에러 alert
    if (errors.name) {
      Alert.alert("알림", errors.name.message  as string);
    } else if (errors.telno) {
      Alert.alert("알림", errors.telno.message  as string);        
    } 
  };

  // TelNo Modal close
  const handleIdIsClose = () => {
    props.setIdIsOpen(false);
  };

  return (
    <View style={styles.containersn}>
      <View style={styles.headerst}>
        <Text style={styles.headerText}>ID 찾기</Text>
      </View>
      <View style={styles.content}>
        <View>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, {width: width*0.60, height: height*0.05} ]}         
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
                style={[styles.input, {width: width*0.60, height: height*0.05} ]}           
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
        <View style={styles.serchsn}>       
          <Button label="조회" 
                  onPress={handleSubmit(onSubmit, onInvalid)} 
                  //icon={"magnify"} 
                  isFormValid={false} 
                  widthSize={0.20} 
                  heightSize={0.05}
                  fontSize={12}/>
          <Button label="닫기" 
                  onPress={handleIdIsClose} 
                  //icon={"door-closed"} 
                  isFormValid={false} 
                  widthSize={0.20} 
                  heightSize={0.05}
                  fontSize={12}/>
        </View>
        <View>
          <Text style={styles.text}>사용자 ID: {id}</Text>
        </View>
      </View>
    </View>
  );
};

export default IdSerchView;