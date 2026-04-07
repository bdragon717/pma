/**
 * Schedule Data List View
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useBackHandler } from '@/src/hooks/useBackHandler';
import { ScheduleListData } from '@/src/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  FlatList,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const conditionSchema = z.object({
  year: z.string()
         .regex(/^[0-9]*$/, "숫자만 입력 가능합니다") // 빈 값 포함 숫자만 허용
         .or(z.literal('')), // 빈 문자열("")인 경우 위 조건들을 무시하고 통과시켜줌       
  month: z.string()
          .regex(/^[0-9]*$/, "숫자만 입력 가능합니다")
          .refine((val) => {    
             if (val === '') return true; // 빈 문자열은 통과  
             const num = parseInt(val, 10);
             return num >= 1 && num <= 12; // 숫자로 변환 후 범위 체크
           }, { message: "1월에서 12월 사이만 가능합니다" }),         
  day: z.string()
        .regex(/^[0-9]*$/, "숫자만 입력 가능합니다")
        .refine((val) => {
           if (val === '') return true;
           const num = parseInt(val, 10);
           return num >= 1 && num <= 31;
         }, { message: "1일에서 31일 사이만 가능합니다" }),
  complete: z.string().catch(''),
});

// 스키마를 통해 TypeScript 타입 자동 추출
type ConditionFormValues = z.infer<typeof conditionSchema>;

// Dropdown Data
const completeDropdownData = [
  { label: '전체', value: 'A' },
  { label: '미완료', value: 'N' },
  { label: '완료', value: 'S' },
];

const monthDropdownData = [
  { label: '월', value: '' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '10', value: '10' },
  { label: '11', value: '11' },
  { label: '12', value: '12' },
];

const ScheduleListView = () => {  
    // useForm에 스키마 주입 및 타입 설정
    const { control, handleSubmit, setValue, getValues, formState: { errors },} = useForm<ConditionFormValues>({
      resolver: zodResolver(conditionSchema),
      mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
      defaultValues: {
        year: '',
        month: '',
        day: '',
        complete: 'N',
      },
    });  
    const [scheduleList, setScheduleList] = useState<ScheduleListData[]>([]); // DB Data
    const { scheduleListSelectSql } = useDatabase() as any; // Select SQL
    const { width, height } = useWindowDimensions();
    const { styles } = useTheme();
    const router = useRouter(); // 경로
    const [dayDropdownData, setDayDropdownData] = useState([{ label: '', value: '' }]); // day 콤보 데이터
    const [showCondition, setShowCondition] = useState(false); 

    // 종료여부 
    useBackHandler();

    // year 값을 실시간 감시
    const selectedYear = useWatch({
      control,
      name: 'year',
    });
    
    // month 값을 실시간 감시
    const selectedMonth = useWatch({
      control,
      name: 'month',
    });
    
    // 년도나 월이 바뀔 때마다 '일' 데이터 갱신
    useEffect(() => {
      // 현재 선택된 일자 값 가져오기
      const { day } = getValues();
    
      // 기준 연도 설정 (입력값 없으면 당년)
      const yearNum = selectedYear && !isNaN(parseInt(selectedYear)) 
                    ? parseInt(selectedYear) 
                    : new Date().getFullYear();
    
      // 기준 월 설정 (선택값 없으면 당월)
      const monthNum = selectedMonth && !isNaN(parseInt(selectedMonth))
                     ? parseInt(selectedMonth)
                     : new Date().getMonth() + 1;
    
      // 해당 연도/월의 마지막 날짜 계산
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
    
      // 일(Day) 드롭다운 데이터 생성
      const newDays = Array.from({ length: lastDay }, (_, i) => ({
        label: (i + 1).toString(),
        value: (i + 1).toString(), 
      }));
    
      // 기본값 null(빈값)을 포함하여 셋팅
      setDayDropdownData([{ label: '일', value: '' }, ...newDays]);
    
      // 현재 선택된 일자가 계산된 마지막 날보다 크면 초기화
      const dayNum = parseInt(day, 10);
      if (!isNaN(dayNum) && dayNum > lastDay) {
        setValue('day', '');
      }
    }, [selectedYear, selectedMonth, setValue]); 

    // Schedule List Item 렌더러
    const renderItem = ({ item }: { item: ScheduleListData }) => (
      <View style={styles.itemft}>
        <Text style={styles.textel}>
          [{item.year}/{item.month}/{item.day}]
        </Text>
        <Text style={styles.texttw}
              numberOfLines={1} // 한 줄로 표시
              ellipsizeMode="tail" // 말줄임표(...) 끝에 표시
              onPress={() => handleOpenDetail(item.pmid)}
        >
          {item.title}
        </Text>
        <Text style={styles.texttt}>
          {item.completion}
        </Text>
      </View>
    );

     // Schedule Select
    const onSubmit = async (data: ConditionFormValues) => {
      const rows = await scheduleListSelectSql('S', data.year, data.month, data.day, data.complete);
      setScheduleList(rows);
    };
    
    // 상세 조회 호출 함수
    const handleOpenDetail = (pmid: string) => {
      router.push({
        pathname: '/scheduleDetailView', // (modals) 폴더 안의 파일명
        params: { pmid }       // 상세 데이터 전달
      });
    };

    // 등록 화면 호출 함수
    const handleOpenRegist = () => {
      router.push({
        pathname: '/scheduleRegist', // (modals) 폴더 안의 파일명
      });
    };

    // 삭제 화면 호출 함수
    const handleOpenDelete = () => {
      router.push({
        pathname: '/scheduleDelete', // (modals) 폴더 안의 파일명
      });
    };

  return (
      <View style={styles.containerze}>  
         {/* 검색 */}
         <View style={styles.serchst}> 
           <Button label={showCondition ? "닫기" : "열기"} 
                   onPress={() => setShowCondition(prev => !prev)} 
                   //icon={"magnify"} 
                   isFormValid={false} 
                   widthSize={0.20} 
                   heightSize={0.05}
                   fontSize={12}/>
           <Button label="조회" 
                   onPress={handleSubmit(onSubmit)} 
                   //icon={"magnify"} 
                   isFormValid={false} 
                   widthSize={0.20} 
                   heightSize={0.05}
                   fontSize={12}/>
           <Button label="쓰기" 
                   onPress={handleOpenRegist} 
                   //icon={"pencil"} 
                   isFormValid={false} 
                   widthSize={0.20} 
                   heightSize={0.05}
                   fontSize={12}/>
           <Button label="삭제" 
                   onPress={handleOpenDelete} 
                   //icon={"pencil"} 
                   isFormValid={false} 
                   widthSize={0.20} 
                   heightSize={0.05}
                   fontSize={12}/>
         </View>
         {showCondition && (
         <View style={styles.serchth}>
           <Controller
             control={control}
             name="year"
             render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, {width: width*0.20, height: height*0.05}]}           
                value={value}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  onChange(numericValue);
                }}
                onBlur={onBlur}
                placeholder="년"
                autoCapitalize="none"
                placeholderTextColor="gray"    
                keyboardType="number-pad"
                maxLength={4}
              />
             )}
           />
           {errors.year && <Text style={styles.errorText}>{errors.year.message}</Text>}
           <Controller
             control={control}
             name="month"
             render={({ field: { onChange, value } }) => (
               <Dropdown
                 style={styles.dropdownsn} // 테두리 등 스타일 지정
                 placeholderStyle={styles.placeholder}
                 selectedTextStyle={styles.selectedText} // 여기가 선택된 글자 스타일
                 placeholder="월"
                 maxHeight={300} // 리스트의 최대 높이
                 dropdownPosition="auto" // 'auto', 'top', 'bottom' 중 선택
                 data={monthDropdownData}
                 labelField="label"
                 valueField="value"
                 value={value}
                 onChange={val => {
                   onChange(val.value); // month 값 업데이트
                   setValue('day', '');  // useForm 내의 day 값을 빈 값으로 초기화
                 }}
               />
             )}
           />
           {errors.month && <Text style={styles.errorText}>{errors.month.message}</Text>}
           <Controller
             control={control}
             name="day"
             render={({ field: { onChange, value } }) => (
               <Dropdown
                 style={styles.dropdownsn} // 테두리 등 스타일 지정
                 placeholderStyle={styles.placeholder}
                 selectedTextStyle={styles.selectedText} // 여기가 선택된 글자 스타일
                 placeholder="일"
                 maxHeight={300} // 리스트의 최대 높이
                 dropdownPosition="auto" // 'auto', 'top', 'bottom' 중 선택
                 data={dayDropdownData}
                 labelField="label"
                 valueField="value"
                 value={value}
                 onChange={val => {
                   onChange(val.value); // day 값 업데이트
                 }}
               />
             )}
           />
           {errors.day && <Text style={styles.errorText}>{errors.day.message}</Text>}
           <Controller
             control={control}
             name="complete"
             render={({ field: { onChange, value } }) => (
               <Dropdown
                 style={styles.dropdown} // 테두리 등 스타일 지정
                 placeholderStyle={styles.placeholder}
                 selectedTextStyle={styles.selectedText} // 여기가 선택된 글자 스타일
                 placeholder="상태"
                 maxHeight={200} // 리스트의 최대 높이
                 dropdownPosition="auto" // 'auto', 'top', 'bottom' 중 선택
                 data={completeDropdownData}
                 labelField="label"
                 valueField="value"
                 value={value}
                 onChange={val => {
                   onChange(val.value); // complete 값 업데이트
                 }}
               />
             )}
           />
           {errors.complete && <Text style={styles.errorText}>{errors.complete.message}</Text>} 
         </View>
         )}               
         {/* 목록 조회 */} 
          <View style={styles.content}>
           <FlatList<ScheduleListData>
             ItemSeparatorComponent={() => <View style={styles.separator}/>} // 리스트 내의 각 항목 사이에 구분선을 렌더링하는 데 사용되는 속성
             data={scheduleList} // 화면에 표시할 리스트 아이템을 담고 있는 배열을 지정하는 필수 속성
             renderItem={renderItem} // 데이터 배열의 각 요소를 어떻게 렌더링할지 정의하는 콜백 함수
             keyExtractor={item => item.pmid} // 각 항목에 대한 고유한 키(React Key)를 생성하도록 지시하는 속성
             contentContainerStyle={{ paddingBottom: 50 }} // FlatList 자체에 하단 여백을 줌
           />
         </View>         
      </View>
  );
}

export default ScheduleListView;