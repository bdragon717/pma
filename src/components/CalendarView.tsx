/**
 * Calendar
 */

import Button from '@/src/components/Button';
import { useTheme } from '@/src/contexts/ThemeContext';
import { CalendarViewProp } from '@/src/utils/types';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

const CalendarView = (props: CalendarViewProp) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedYearMonthDay, setSelectedYearMonthDay] = useState('');
  const { styles, colors } = useTheme();

  // 사용자가 날짜를 선택했을 때 호출되는 콜백 함수
  const onDayPress = (day: DateData) => {
    // 'day' 객체는 다음과 같은 정보를 포함합니다:
    // {year: 2025, month: 12, day: 12, dateString: '2025-12-12'}

    setSelectedDate(day.dateString);

    // 특정 년, 월, 일 정보를 추출하여 상태에 저장
    setSelectedYearMonthDay(
      `${day.year}년 ${day.month}월 ${day.day}일`
    );

    // 날자 셋팅
    props.setYear(String(day.year));
    props.setMonth(String(day.month));
    props.setDay(String(day.day));
  };

  // Calendar Modal Close
  const handleCalendarIsOpen = () => {
    props.setCalendarIsOpen(false);
  };

  return (
    <View style={styles.container}>      
      <View>
        <Text style={styles.headerth}>
          일정 등록 날짜 선택
        </Text>
        <Calendar
          // 현재 날짜로부터 달력을 시작합니다.
          current={Date()}
          // 날짜 선택 시 호출될 함수를 연결합니다.
          onDayPress={onDayPress}
          // 선택된 날짜를 UI에 표시하기 위한 마킹 설정
          markedDates={{
            [selectedDate as string]: { selected: true, disableTouchEvent: true, selectedColor: 'blue' }
          }}
          theme={{
              selectedDayBackgroundColor: colors.deepSkyBlue, todayTextColor: colors.deepSkyBlue, arrowColor: colors.deepSkyBlue}}
        />
        {selectedDate && (
          <Text style={styles.resultText}>
            선택된 날짜: {selectedYearMonthDay}
          </Text>
        )} 
      </View>
      <View style={styles.buttonfh}>
        <Button label="닫기" 
                onPress={handleCalendarIsOpen} 
                //icon={"door-closed"} 
                isFormValid={false} 
                widthSize={0.50} 
                heightSize={0.05}
                fontSize={12}/>
      </View>    
    </View>
  );
};

export default CalendarView;