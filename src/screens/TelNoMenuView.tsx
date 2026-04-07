/**
 * 핸드폰 내 전화번호 가져오기(특정인)
 * 라이브러리 설치 : npx expo install expo-contacts
 * app.json 설정(Android)
 * {
  "expo": {
    ...
    "android": {
      "permissions": ["READ_CONTACTS"],
      ...
    },
    ...
  }
}
*/

import Button from '@/src/components/Button';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ContactItemData } from '@/src/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Contacts from 'expo-contacts';
import React, { useState } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const inputSchema = z.object({
  inputText: z.string()
              .min(1, { message: "이름을 입력하세요." }) // 최소 1글자 이상
              .refine((val) => val.trim() !== "", "이름을 입력하세요."), // 공백 체크
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputFormValues = z.infer<typeof inputSchema>;

const TelNoMenuView = () => {
  const [matchedContacts, setMatchedContacts] = useState<ContactItemData[]>([]);
  const { styles } = useTheme();
  const { width, height } = useWindowDimensions();

  // useForm에 스키마 주입 및 타입 설정
  const { control, handleSubmit, formState: { errors },} = useForm<InputFormValues>({
    resolver: zodResolver(inputSchema),
    mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
    defaultValues: {
      inputText: '',
    },
  });

  // contactName에 포함된 모든 전화번호 찿기
  const onSubmit = async (formData: InputFormValues) => {
    // 현재 권한 상태 확인
    const permission = await Contacts.getPermissionsAsync();
    if (permission.status !== 'granted') {
      // 권한 요청
      const request = await Contacts.requestPermissionsAsync();
      // 설정 요청
     if (request.status !== 'granted') {
        if (!request.canAskAgain) {
          Alert.alert(
            '권한 필요',
            '연락처 접근 권한이 꺼져 있습니다.\n설정에서 직접 허용해주세요.',
            [
              { text: '설정으로 이동', onPress: () => Linking.openSettings() },
              { text: '취소', style: 'cancel' },
            ]
          );
        }
        return;
      }
    }
    // 연락처 가져오기
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });
    if ( ! data || data.length === 0) {
      setMatchedContacts([]);
      Alert.alert("알림", "연락처가 없습니다. 확인하세요.");
      return;
    }
    // 필터링 + 안전한 매핑
    const searchName = formData.inputText.trim().toLowerCase();
    const filteredContacts: ContactItemData[] = Object.values(
          data.filter(contact => contact.name && contact.name.toLowerCase().includes(searchName))
              .reduce((acc: any, contact) => {
                const key = contact.name; // 이름 기준 병합
                if (!acc[key]) {
                  acc[key] = {
                    name: contact.name,
                    phoneNumber: [],
                  };
                }
                if (contact.phoneNumbers) {
                  const numbers = contact.phoneNumbers.map(p => p.number  ?? ''.replace(/\s|-/g, '')
                                                                               .replace(/^(\+82|82)/, '0'));
                  acc[key].phoneNumber.push(...numbers);
                }

                // 번호 중복 제거
                // Set() : 고유한 값들의 집합을 다루는 자료구조, 데이터 중복을 제거하고 유일한 값들을 효과적으로 관리
                acc[key].phoneNumber = [...new Set(acc[key].phoneNumber)];
                return acc;
              }, {})
     );  
     // 저장
     setMatchedContacts(filteredContacts);
  };

  // 전화걸기
  const callPhone = async (phoneNumber: string | undefined) => {
    const number = phoneNumber ?? ''.replace(/[^0-9+]/g, '');
    const url = `tel:${number}`;
    Linking.openURL(url); // 전화걸기
  };

  // 목록의 각 항목을 렌더링하는 함수
  const renderItem = ({ item }: { item: ContactItemData }) => (
    <View style={styles.itemsd}>
      <Text>{item.name}</Text>
      {item.phoneNumber.map((number, index) => (
        <Pressable key={index}
                   onPress={() => callPhone(number)}
                   onLongPress={() => Linking.openURL(`sms:${number}`)}
                   style={{ alignSelf: 'flex-start' }} // 1. 텍스트 길이만큼만 영역 잡기
        >
          <Text style={styles.phone}
          >
            {number ?? ''.trim()}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  // 실패 시 Error Message 함수
  const onInvalid = (errors: FieldErrors) => {
    // 특정 필드 에러 alert
    if (errors.inputText) {
      Alert.alert("알림", errors.inputText.message  as string);
    } else {
      // 필드 상관없이 첫 번째 에러 메시지 띄우기
      const errorMessages = Object.values(errors);
      if (errorMessages.length > 0) Alert.alert("알림", errorMessages[0]?.message  as string);
    }
  };  

  return (
      <View style={styles.containerze}>
        {/* 검색 */}
        <View style={styles.serchst}>
          <Controller
            control={control}
            name="inputText"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, {width: width*0.60, height: height*0.05}]}           
                value={value}
                onChangeText={onChange}
                textAlignVertical='top' // android에서 입력 시작 위치가 위쪽에 오도록
                scrollEnabled={true} // 입력창 안에서 스크롤 가능
                onBlur={onBlur}
                autoFocus={true}
                placeholder="이름"
                autoCapitalize="none"
                placeholderTextColor="gray"
              />
            )}
          />
          {errors.inputText && <Text style={styles.errorText}>{errors.inputText.message}</Text>}          
          <Button label="조회" 
               onPress={handleSubmit(onSubmit, onInvalid)} 
               //icon={"magnify"} 
               isFormValid={false} 
               widthSize={0.20} 
               heightSize={0.05}
               fontSize={12}
          />
        </View>     
        {/* 상세조회 */}
         <View style={styles.content}>
           <FlatList<ContactItemData>
                ItemSeparatorComponent={() => <View style={styles.separator}/>} // 리스트 내의 각 항목 사이에 구분선을 렌더링하는 데 사용되는 속성
                data={matchedContacts} // 화면에 표시할 리스트 아이템을 담고 있는 배열을 지정하는 필수 속성
                renderItem={renderItem} // 데이터 배열의 각 요소를 어떻게 렌더링할지 정의하는 콜백 함수
                keyExtractor={(item, index) => index.toString()} // 각 항목에 대한 고유한 키(React Key)를 생성하도록 지시하는 속성
                contentContainerStyle={{ paddingBottom: 50 }} // FlatList 자체에 하단 여백을 줌
           />
        </View>
        <View style={styles.infost}>
            <Text style={styles.infoText}>전화 짧게누름</Text>
            <Text style={styles.infoText}>문자 길게누름</Text>
        </View>
      </View>
  );
}

export default TelNoMenuView;