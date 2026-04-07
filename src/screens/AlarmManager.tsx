import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { AlarmData } from '@/src/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Notifications from 'expo-notifications';
import React, { useState } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import {
  Alert,
  FlatList,
  Modal,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from 'react-native';
//import { Dropdown } from 'react-native-element-dropdown';
import { z } from 'zod'; // 유효성 검사
import { colors } from '../utils/Theme';

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const inputSchema = z.object({
  hour: z.string()
         .regex(/^[0-9]*$/, "숫자만 입력 가능합니다")
         .min(1, "시를 입력하세요,") // 최소 1글자 이상
         .refine((val) => val.trim() !== "", "시를 입력하세요,"),
         //.or(z.literal('')), // 빈 문자열("")인 경우 위 조건들을 무시하고 통과시켜줌         
  minute: z.string()
           .regex(/^[0-9]*$/, "숫자만 입력 가능합니다")
           .min(1, "분를 입력하세요,") // 최소 1글자 이상
           .refine((val) => val.trim() !== "", "분를 입력하세요,"),
           //.or(z.literal('')), // 빈 문자열("")인 경우 위 조건들을 무시하고 통과시켜줌
  title: z.string().catch(''),
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputFormValues = z.infer<typeof inputSchema>;

const AlarmManager = () => {
  const [alarms, setAlarms] = useState<AlarmData[]>([]); // DB 현재 일자 보다 큰 알람
  const [comboalarms, setComboAlarms] = useState<AlarmData[]>([]); // Combo에서 선택한 알람
  const { alarmSelectSql, alarmInsertSql, alarmUpdateSql, alarmDeleteSql } = useDatabase() as any; // SQL
  const { styles } = useTheme();
  const { width, height } = useWindowDimensions();
  const [id, setId] = useState<number>();
  const [addalarm, setaddAlarm] = useState(false);
  const [togglealarm, setToggleAlarm] = useState(false);
  const [showCondition, setShowCondition] = useState(false); 

  // useForm에 스키마 주입 및 타입 설정
  const { control, handleSubmit, getValues, reset, formState: { isValid, errors },} = useForm<InputFormValues>({
    resolver: zodResolver(inputSchema),
    mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
    defaultValues: {
      hour:'',
      minute:'',
      title: '',
    },
  });

  // 전체 알람 조회(오늘날자이후)
  const getAlarms = async() => {
    // 현재 입력된 값을 실시간으로 가져옴
    const { title } = getValues();
    // 년월일 셋팅
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const hour = today.getHours().toString().padStart(2, '0');
    const minute = today.getMinutes().toString().padStart(2, '0');
    // DB 알람 Select
    const fetchedAlarms = await alarmSelectSql(undefined, undefined, null, year, month, day, hour, minute, title);
    setAlarms(fetchedAlarms || []); // 상태 업데이트 (다음 렌더링용)
    return fetchedAlarms || [];     // 최신 데이터를 즉시 반환 (연속 작업을 위해)
  }

  // 렌더링 전에 Dropdown에 표시하기 위해 데이터를 미리 합침.
  const combinedData = alarms.map(item => ({
    ...item,
    // Dropdown에서 사용할 '합쳐진 라벨' 필드를 새로 생성합니다.
    customLabel: `${item.title} ${item.hour}:${item.minute}` 
  }));
 
  // Combo 알람 조회(오늘날자이후)
  const getComboAlarms = async(id: number, argalarms: AlarmData[]) => {
    // Combo 선택 알람 추출 : 최신 데이터(latestAlarms)에서 찾음
    const alarm = argalarms.find(item => item.id === id);
    if (!alarm) {
      Alert.alert("알림", "알람을 선택한 후 하세요.");
      return;
    }
    // Combo 선택 전체 알람 추출
    const comboAlarm = argalarms.filter(item => item.pmid === alarm.pmid);
    if (!comboAlarm) return;
    setComboAlarms(comboAlarm);
  }  

  // OS 알람 추가 + 알림 예약
  const onSubmit = async (data: InputFormValues) => {
    // Combo 선택 알람 추출
    const alarm = alarms.find(item => item.id === id);
    if (!alarm) {
      Alert.alert("알림", "알람을 선택한 후 하세요.");
      return;
    }
    // 알람 시간
    const date = new Date(alarm.year, alarm.month - 1, alarm.day, Number(data.hour), Number(data.minute), 0, 0);
    if (date <= new Date()) {
      Alert.alert("알림", "알람 시간이 지난 시간입니다. 확인하세요.");
      return null;
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
             body: alarm.title,
             sound: undefined, // 기본 알림음 사용
           },
           trigger,
         });
         // DB 알람 추가
         await alarmInsertSql(alarm.pmid, alarm.title, alarm.year, alarm.month, alarm.day, data.hour, data.minute, 1, 1, notificationId); 
    } catch (error) {
      console.error('알람 등록 실패 :', error);      
    }
    
    Alert.alert("알림", "추가한 알람이 저장 되었습니다. 재조회 하여 확인 하세요.");
    reset();
    setaddAlarm(false);
  }

  // DB/OS 알람 ON/OFF 토글
  const toggleAlarm = async(alarm: AlarmData, newValue: boolean) => {
    if (!newValue) {
      // OS OFF
      try {
           if (alarm.notificationId) {
             await Notifications.cancelScheduledNotificationAsync(alarm.notificationId);
           }
           // DB OFF
           await alarmUpdateSql(alarm.id, 0, null); // 알람 끄기
           // 재조회 
          const latestData = await getAlarms();            // 최신 데이터 가져오기
          await getComboAlarms(alarm.id, latestData);      // 그 데이터를 바로 넘겨주기
      } catch (error) {
        console.error('알람 등록 실패 :', error);        
      }      
    } else {
      // 알람 시간
      const date = new Date(alarm.year, alarm.month - 1, alarm.day, alarm.hour, alarm.minute, 0, 0);
      if (date <= new Date()) {
        Alert.alert("알림", "알람 시간이 지난 시간입니다. 확인하세요.");
        return;
      }
      // trigger 생성  
      const trigger: Notifications.DateTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: date,
      };
      // OS ON
      try {
           const notificationId = await Notifications.scheduleNotificationAsync({
             content: {
               title: '⏰ 알람',
               body: alarm.title,
               sound: 'undefined', // 기본 알림음 사용
             },
             trigger,
           });
           // DB ON
           await alarmUpdateSql(alarm.id, 1, notificationId); // 알람 켜기
           // 재조회
          const latestData = await getAlarms();            // 최신 데이터 가져오기
          await getComboAlarms(alarm.id, latestData);      // 그 데이터를 바로 넘겨주기
      } catch (error) {
        console.error('알람 등록 실패 :', error);         
      }        
    }
  }

  // 알람 삭제
  const deleteAlarm = async(alarm: AlarmData) => {
    // OS 알람 끄기
    if (alarm.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(alarm.notificationId); 
    }
    // DB 알람 끄기
    await alarmDeleteSql(alarm.id);
  }

  // 알람 목록 조회
  const renderItem = ({ item }: { item: AlarmData }) => {
    const isSelected = item.id === id;

    return (
      <View style={[styles.itemsn, isSelected && { backgroundColor: colors.pastelBlue}]}>         
        <Text style={styles.textni}
              numberOfLines={1} // 최대 1줄만 표시
              ellipsizeMode="tail" // 텍스트가 넘치면 끝에 점으로 표시
              onPress={() => {
                setId(item.id);
                setaddAlarm(false);
                setToggleAlarm(false);
              }}
        >
          {item.title}        
        </Text>
        <Text style={styles.texttn}>
          {String(item.hour).padStart(2, '0')}:{String(item.minute).padStart(2, '0')}
        </Text>
    </View>
    );    
  };

  // 토글 알람 목록 조회
  const togglealarmlist = ({ item }: { item: AlarmData }) => (
    <View style={styles.itemsn}>      
      <Text style={styles.textni}
            numberOfLines={1} // 최대 1줄만 표시
            ellipsizeMode="tail" // 텍스트가 넘치면 끝에 점으로 표시
      >
        {item.title}
      </Text>
      <Text style={styles.time}>
        {String(item.hour).padStart(2, '0')}:{String(item.minute).padStart(2, '0')}
      </Text>
      <Switch value={item.isEnabled === 1}
              onValueChange={(newValue) => toggleAlarm(item, newValue)}
      />
    </View>
  );

  // Alarm 조회
  const handleGetAlarm = async () => {
    setaddAlarm(false);
    setToggleAlarm(false);
    await getAlarms();
    //Alert.alert("알림", `[${latestData.length}]건의 알람을 조회 하였습니다.`);
  };

  // Alarm 추가
  const handleAddAlarm = () => {
    const alarm = alarms.find(item => item.id === id);
    if (!alarm) {
      Alert.alert("알림", "알람을 선택한 후 하세요.");
      return;
    }
    setaddAlarm(true);
    setToggleAlarm(false);
    reset();
  };

  // Alarm 수정
  const handleUpdateAlarm = () => {
    setToggleAlarm(true);
    setaddAlarm(false);
    getComboAlarms(id ?? 0, alarms);
  };

  // Alarm 삭제
  const handleDeleteAlarm = () => {
    setaddAlarm(false);
    setToggleAlarm(false);
    // Combo 선택 알람 추출
    const alarm = alarms.find(item => item.id === id);
    if (!alarm) {
      Alert.alert("알림", "알람을 선택한 후 하세요.");
      return;
    }
    Alert.alert(
      "삭제 확인", // 제목
      "삭제하시겠습니까?, 삭제 후 재조회 하여 확인 하세요.", // 메시지
      [
        {
          text: "취소",
          style: "cancel" // iOS에서 굵은 글씨로 취소 강조
        },
        { 
          text: "삭제", 
          onPress: async () => {
            // 삭제
            deleteAlarm(alarm);
          },
          style: "destructive" // iOS에서 빨간색으로 위험 강조
        }
      ]
    );
  };

  // 실패 시 Error Message 함수
  const onInvalid = (errors: FieldErrors) => {
    // 특정 필드 에러 alert
    if (errors.hour) {
      Alert.alert("알림", errors.hour.message  as string);
    } else if (errors.minute) {
      Alert.alert("알림", errors.minute.message  as string);
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
          <Button label={showCondition ? "닫기" : "열기"} 
                  onPress={() => setShowCondition(prev => !prev)} 
                  //icon={"magnify"} 
                  isFormValid={false} 
                  widthSize={0.15} 
                  heightSize={0.05}
                  fontSize={12}/>
          <Button label="조회" 
                  onPress={handleGetAlarm} 
                  //icon={"magnify"} 
                  isFormValid={false} 
                  widthSize={0.15} 
                  heightSize={0.05} 
                  fontSize={12}/>
          <Button label="추가" 
                  onPress={handleAddAlarm} 
                  //icon={"pencil"} 
                  isFormValid={false} 
                  widthSize={0.15} 
                  heightSize={0.05} 
                  fontSize={12}/>
          <Button label="수정" 
                  onPress={handleUpdateAlarm} 
                  //icon={"pencil"} 
                  isFormValid={false} 
                  widthSize={0.15} 
                  heightSize={0.05} 
                  fontSize={12}/>
          <Button label="삭제" 
                  onPress={handleDeleteAlarm} 
                  //icon={"trash-can-outline"} 
                  isFormValid={false} 
                  widthSize={0.15} 
                  heightSize={0.05} 
                  fontSize={12}/>        
      </View>
      {showCondition && (
      <View style={styles.serchth}>          
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, {width: width*0.90, height: height*0.05}]}           
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="제목"
              autoCapitalize="none"
              placeholderTextColor="gray" 
            />
          )}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
      </View>
      )}
      {/* 목록 조회 */}
      <View style={styles.content}>
        <FlatList<AlarmData>
          ItemSeparatorComponent={() => <View style={styles.separator}/>} // 리스트 내의 각 항목 사이에 구분선을 렌더링하는 데 사용되는 속성
          data={alarms} // 화면에 표시할 리스트 아이템을 담고 있는 배열을 지정하는 필수 속성
          renderItem={renderItem} // 데이터 배열의 각 요소를 어떻게 렌더링할지 정의하는 콜백 함수
          keyExtractor={item => item.id.toString()} // 각 항목에 대한 고유한 키(React Key)를 생성하도록 지시하는 속성
          contentContainerStyle={{ paddingBottom: 50 }} // FlatList 자체에 하단 여백을 줌
          extraData={id} // 배경색
        />
      </View>      
      {/* 알람수정 */}
      {togglealarm && (       
        <View style={styles.content}>
          <Text style={styles.titleth}>알람수정</Text>
          <FlatList<AlarmData>
            data={comboalarms}            
            renderItem={togglealarmlist}
            keyExtractor={item => item.id.toString()}
            ItemSeparatorComponent={() => <View style={styles.separator}/>}
            contentContainerStyle={{ paddingBottom: 50 }}
          />    
        </View> 
      )}
      {/* 알람추가 */}
      <View>          
        <Modal visible={addalarm}
               transparent={true}
               animationType="fade"
               onRequestClose={() => setaddAlarm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {width: '80%', height: '22%'}]}>
              <Text style={styles.title}>알람추가</Text>
              <View style={styles.serchsn}>
                <Controller
                  control={control}
                  name="hour"
                  render={({ field: { onChange, onBlur, value } }) => (
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
              <View style={styles.serchsn}>
                <Button label="취소" 
                        onPress={() => setaddAlarm(false)}
                        //icon={"cancel"} 
                        isFormValid={false} 
                        widthSize={0.20} 
                        heightSize={0.055}
                        fontSize={14}/>
                <Button label="저장" 
                        onPress={handleSubmit(onSubmit, onInvalid)} 
                        //icon={"pencil"} 
                        isFormValid={!isValid} 
                        widthSize={0.20} 
                        heightSize={0.055} 
                        fontSize={14}/>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

export default AlarmManager;