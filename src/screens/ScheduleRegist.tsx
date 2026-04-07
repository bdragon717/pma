/**
 * Schedule Data Regist
 */

import Button from '@/src/components/Button';
import CalendarView from '@/src/components/CalendarView';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ScheduleFormData, ScheduleRegistProp } from '@/src/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import {
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const inputSchema = z.object({
  hour: z.string()
         .regex(/^[0-9]*$/, "숫자만 입력 가능합니다")
         .or(z.literal('')), // 빈 문자열("")인 경우 위 조건들을 무시하고 통과시켜줌         
  minute: z.string()
           .regex(/^[0-9]*$/, "숫자만 입력 가능합니다")
           .or(z.literal('')), // 빈 문자열("")인 경우 위 조건들을 무시하고 통과시켜줌
  inputText: z.string()
              .min(1, { message: "입력 후 추가하세요." }) // 최소 1글자 이상
              .refine((val) => val.trim() !== "", "입력 후 추가하세요."), // 공백 체크
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputFormValues = z.infer<typeof inputSchema>;

const ScheduleRegist = (props: ScheduleRegistProp) => {
  const { dbRef, pmmasterInsertSql, scheduleInsertSql, alarmInsertSql } = useDatabase() as any; // SQL 
  const [todos, setTodos] = useState<ScheduleFormData[]>([]);  // 할 일 목록을 저장할 배열 상태 (초기값: 빈 배열)  
  const [year, setYear] = useState<string>(new Date().getFullYear().toString()); // year 변수
  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString()); // month 변수
  const [day, setDay] = useState<string>(new Date().getDate().toString()); // day 변수
  const { styles } = useTheme();
  const [calendarIsOpen, setCalendarIsOpen] = useState(false); // Calendar Modal Open
  const { width, height } = useWindowDimensions();
  const router = useRouter(); // 경로
  const inputRef = useRef<TextInput>(null); // 포커스 지정

  // useForm에 스키마 주입 및 타입 설정
  const { control, handleSubmit, getValues, resetField, formState: { isValid, errors },} = useForm<InputFormValues>({
    resolver: zodResolver(inputSchema),
    mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
    defaultValues: {
      hour:'09',
      minute:'00',
      inputText: '',
    },
  });
  
  // OS 알람 추가 + 알림 예약  
  const addAlarm = async(title: string,
                         hour: string,
                         minute: string) => {
    // 알람 시간
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 0, 0);
    if (date <= new Date()) {
      Alert.alert("알림", "알람 시간이 지난 시간입니다. 확인하세요.");
      inputRef.current?.focus(); // 입력창에 포커스 지정
      return false;
    }
    // trigger 생성  
    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: date,
    };
    // OS 알림 예약
    try {         
         const notificationId = await Notifications.scheduleNotificationAsync({
           content: {
             title: '⏰ 알람',
             body: title,
             sound: undefined, // 기본 알림음 사용
           },
           trigger,
         });
         return notificationId;      
    } catch (error) {
      console.error('알람 등록 실패 :', error);      
    }
  }

  // 배열에 새 항목을 추가하는 함수  
  const onSubmit = async (data: InputFormValues) => {
    // 입력된 텍스트가 비어있지 않은지 확인
    if (data.inputText.trim().length > 0) {
      const newTodo = {
        contents: data.inputText,
      };

      // setTodos 함수를 사용하여 기존 배열에 새 항목을 추가합니다.
      // 전개 구문(spread syntax, ...)을 사용하여 불변성(immutability)을 유지합니다.
      setTodos(prevTodos => [...prevTodos, newTodo]);
      
      // 입력 필드 초기화
      resetField("inputText");
    }
  };

  // 목록의 각 항목을 렌더링하는 함수
  const renderItem = ({ item }: { item: ScheduleFormData }) => (
    <View style={styles.todoItem}>
      <Text style={styles.textfh}
            ellipsizeMode="tail" // 텍스트가 넘치면 끝에 점으로 표시
      >
        {item.contents}
      </Text>
    </View>
  );

  // DB 등록
  const registData = async () => {
    if ( ! dbRef.current) {
      Alert.alert("에러", "데이터베이스 연결이 없습니다.");
      return;
    }

    try {
      // 1. DB 인스턴스 가져오기 (이미 정의된 db 객체 사용)
      await dbRef.current.withTransactionAsync(async () => {
        
        if (props.registFlag === "I") {
          // --- [추가 모드] ---
          await scheduleInsertSql(props.pmid, 'N', todos);
        } else {
          // --- [초기 생성 모드] ---
          const { hour, minute } = getValues();
          const newId = uuidv4();
  
          if (todos.length > 0) {
            const title = `${todos[0].contents}`;
            
            // 외부 API(알람 설정)는 트랜잭션 안에서 실패 시 에러를 던져야 롤백됨
            const notificationId = await addAlarm(title, hour, minute);
            if (!notificationId) {
              throw new Error("알람 생성 실패"); // 에러를 던져야 트랜잭션이 중단됨
            }
  
            // 3개의 INSERT 작업을 하나의 트랜잭션으로 묶음
            // PMMASTER INSERT
            await pmmasterInsertSql(newId, 'S', year, month, day, title, null, undefined);

            // ALARM INSERT
            await alarmInsertSql(newId, title, year, month, day, hour, minute, 1, 1, notificationId);

            // SCHEDULE INSERT  
            await scheduleInsertSql(newId, 'N', todos);
          } else {
            throw new Error("할 일 목록이 없습니다.");
          }
        }
      });
  
      // 모든 작업이 성공적으로 커밋된 후 실행
      return true;
  
    } catch (error) {
      // 트랜잭션 내에서 에러 발생 시 이쪽으로 들어오며 자동 롤백됨
      console.error("데이터 등록 트랜잭션 실패:", error);
      return false;
    }
  };
    
  // DB 저장 
  const handleRegistData = async () => {
    // 등록
    const isSuccess = await registData();

    // 등록 Modal CLose
    if (isSuccess) {
      router.back(); // 현재 모달 닫기 
    }    
  };

  // Calendar Modal Open
  const handleCalendarOpen = () => {
    setCalendarIsOpen(true);
  };

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
      {/* 날자 선택 */}
      {props.registFlag !== "I" && (
        <View style={styles.calendar}>
          <Button label="일자선택" 
                  onPress={handleCalendarOpen} 
                  //icon={"calendar"} 
                  isFormValid={false} 
                  widthSize={0.20} 
                  heightSize={0.05}
                  fontSize={12}/>
          {year && month && day && (
            <View>
              <Text style={styles.textev}>
                {year}/{month}/{day}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.textfh}>알람</Text>
          </View>
          <Controller
             control={control}
             name="hour"
             render={({ field: { onChange, onBlur, value, ref } }) => (
              <TextInput
                style={[styles.input, {width: width*0.10, height: height*0.05}]}           
                value={value}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  onChange(numericValue);
                }}
                onBlur={onBlur}
                placeholder="시"
                autoCapitalize="none"
                placeholderTextColor="gray"    
                keyboardType="number-pad"
                maxLength={2}
                //ref={inputRef} // 입력창에 ref 연결 
                ref={(e) => {
                  ref(e); // react-hook-form의 ref 연결
                  inputRef.current = e; // 외부에서 쓸 inputRef 연결
                }}
              />
             )}
          />
          {errors.hour && <Text style={styles.errorText}>{errors.hour.message}</Text>}
          <Controller
             control={control}
             name="minute"
             render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, {width: width*0.10, height: height*0.05}]}           
                value={value}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  onChange(numericValue);
                }}
                onBlur={onBlur}
                placeholder="분"
                autoCapitalize="none"
                placeholderTextColor="gray"    
                keyboardType="number-pad"
                maxLength={2}
              />
             )}
          />
          {errors.minute && <Text style={styles.errorText}>{errors.minute.message}</Text>}          
        </View>
      )}
      {/* 입력 데이터를 배열에 저장 */}
      <View style={styles.inputContainer}>
        <Controller
          control={control}
          name="inputText"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.contentsInput}           
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
        {errors.inputText && <Text style={styles.errorText}>{errors.inputText.message}</Text>}        
        <Button label="추가" 
                onPress={handleSubmit(onSubmit, onInvalid)} 
                //icon={"pencil"} 
                isFormValid={!isValid} 
                widthSize={0.10} 
                heightSize={0.06}
                fontSize={12}/>        
        {todos.length > 0 && (
          <Button label="저장" 
                  onPress={handleRegistData} 
                  //icon={"content-save"} 
                  isFormValid={false} 
                  widthSize={0.10} 
                  heightSize={0.06}
                  fontSize={12}/>
        )}
      </View>      
      {/* 배열 데이터를 화면에 렌더링 */}
      <View style={styles.content}>
        <FlatList<ScheduleFormData>
          ItemSeparatorComponent={() => <View style={styles.separator}/>} // 리스트 내의 각 항목 사이에 구분선을 렌더링하는 데 사용되는 속성
          data={todos} // 화면에 표시할 리스트 아이템을 담고 있는 배열을 지정하는 필수 속성
          renderItem={renderItem} // 데이터 배열의 각 요소를 어떻게 렌더링할지 정의하는 콜백 함수
          keyExtractor={(item, index) => index.toString()} // 각 항목에 대한 고유한 키(React Key)를 생성하도록 지시하는 속성
          contentContainerStyle={{ paddingBottom: 50 }} // FlatList 자체에 하단 여백을 줌
        />
      </View>      
      {/* Calendar Modal Open */}
      <View>         
        <Modal visible={calendarIsOpen}
               onRequestClose={() => setCalendarIsOpen(false)}
               animationType="fade" // 슬라이드보다 페이드가 팝업 느낌에 더 적합
               transparent={true}
        >  
          <View style={styles.modalOverlay}>{/* 배경 레이어: 화면 전체를 반투명하게 덮음 */}  
            <View style={[styles.modalContent, {width: '80%', height: '70%'}]}>{/* 실제 팝업 컨텐츠: 중앙에 작게 위치 */}
              <CalendarView setCalendarIsOpen={setCalendarIsOpen} 
                            setYear={setYear} 
                            setMonth={setMonth}
                            setDay={setDay} />
            </View>
          </View>
        </Modal>        
      </View>
      {/* note */}
      {props.registFlag !== "I" && (
        <View style={styles.info}>
          <Text style={styles.infoTextst}>
            ※ 알람 일시가 지난 일정은 등록이 않됩니다.
          </Text>
        </View>
      )}
    </View>
  );
};

export default ScheduleRegist;
