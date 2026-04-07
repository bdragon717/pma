/* -----------------------------
  앱 재실행 시 알람 복구
------------------------------ */

import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

export const AlarmRestoreManager = () => {
  const { alarmSelectSql, alarmUpdateSql } = useDatabase() as any;  
  const isProcessing = useRef(false); // 중복 실행 방지를 위한 flag

  useEffect(() => {
    // DB 메서드가 없으면 대기
    if (!alarmSelectSql || !alarmUpdateSql) return;
    if (isProcessing.current) return;

    const restore = async () => {
      isProcessing.current = true;
      try {
           // DB 알람 조회
           const alarms = await alarmSelectSql(undefined, 1, null, null, null, null, null, null);
           if (!alarms || alarms.length === 0) return;

           // OS 현재 스케줄된 알람 조회
           const scheduled = await Notifications.getAllScheduledNotificationsAsync();
           const scheduledIds = new Set(scheduled.map(n => n.identifier));

           // 알람 복구
           for (const alarm of alarms) {
             try {
                  // DB/OS 이미 등록된 알람이면 스킵
                  const existsInOS = alarm.notificationId && scheduledIds.has(alarm.notificationId); // Set 객체에 주어진 요소가 존재하는지 여부를 판별해 반환
                  if (existsInOS) continue;

                  const date = new Date(alarm.year, alarm.month - 1, alarm.day, alarm.hour, alarm.minute, 0, 0);
                  if (date <= new Date()) {
                    await alarmUpdateSql(alarm.id, 0, null);
                    continue;
                  }
                  // trigger 생성  
                  const trigger: Notifications.DateTriggerInput = {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: date,
                  };
                  // OS 알람 복구  
                  const notificationId = await Notifications.scheduleNotificationAsync({
                    content: {
                      title: '⏰ 알람',
                      body: alarm.title,
                      sound: undefined, // 기본 알림음 사용
                    },
                    trigger,
                  });
                  // DB 알람 복구
                  await alarmUpdateSql(alarm.id, undefined, notificationId);
             } catch (error) {
                 console.error('알람 등록 실패 :', error); 
             }        
           }        
      } catch (error) {
          console.error('알람 등록 실패 :', error);  
      } finally {
          isProcessing.current = false;
      }
    }

    restore();
  }, [alarmSelectSql, alarmUpdateSql]); // DB 메서드가 준비되면 실행

  return null; // 화면에 아무것도 그리지 않음  
}
