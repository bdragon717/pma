/**
 * Schedule Data Delete
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ScheduleListData } from '@/src/utils/types';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Text,
  View
} from 'react-native';

const ScheduleDelete = () => {
    const [scheduleList, setScheduleList] = useState<ScheduleListData[]>([]); // Schedule List Data
    const [selectedIds, setSelectedIds] = useState<string[]>([]); // 선택된 항목 ID 목록
    const { scheduleListSelectSql,
            pmmasterMultiDeleteSql,
            scheduleMultiDeleteSql,
            alarmMultiDeleteSql,
            dbRef
          } = useDatabase() as any; // Select SQL
    const { styles } = useTheme();
    const router = useRouter(); // 경로    

    // Schedule Select SQL
    const scheduleSelect = async () => {
      const rows = await scheduleListSelectSql('S', null, null, null, 'S');
      setScheduleList(rows);
    };

    // Schedule Select
    useEffect(() => {
      scheduleSelect();
    }, []);

    // 개별 선택 토글 함수
    const toggleItem = (pmid: string) => {
      setSelectedIds(prev => prev.includes(pmid)
          ? prev.filter(id => id !== pmid) // 이미 선택된 경우 제거
          : [...prev, pmid] // 선택되지 않은 경우 추가
      );
    };

    // 전체 선택 확인
    const isAllSelected = scheduleList.length > 0 && selectedIds.length === scheduleList.length;
    // 전체 선택 토글 함수
    const toggleAll = () => {
      if (isAllSelected) {
        setSelectedIds([]); // 모두 선택 해제
      } else {
        setSelectedIds(scheduleList.map(item => item.pmid)); // 모든 항목 선택
      }
    };

    // Schedule List Item 렌더러
    const renderItem = ({ item }: { item: ScheduleListData }) => {
      const checked = selectedIds.includes(item.pmid);

      return (
        <View style={styles.itemft}>
          <Checkbox style={styles.checkbox}
                    value={checked}
                    onValueChange={() => toggleItem(item.pmid)} // 체크박스 토글
          />
          <Text style={styles.textel}>
            [{item.year}/{item.month}/{item.day}]
          </Text>
          <Text style={[styles.texttw, checked && { opacity: 0.5 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
                onPress={() => toggleItem(item.pmid)} // 텍스트 눌러도 선택
          >
            {item.title}
          </Text>
          <Text style={styles.texttt}>
            {item.completion}
          </Text>
        </View>
      );
    };
    
    // Schedule Delete
    const handleDelete = () => {
      if (selectedIds.length === 0) return; // 선택된 항목이 없으면 종료
    
      Alert.alert(
        '삭제',
        `${selectedIds.length}건의 일정을 삭제하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: async () => {
              if ( ! dbRef.current) {
                Alert.alert("에러", "데이터베이스 연결이 없습니다.");
                return;
              }
    
              try {
                // 트랜잭션 시작: 세 테이블의 삭제를 하나의 작업으로 묶음
                await dbRef.current.withTransactionAsync(async () => {
                  // 각 함수 내부에서 throw error를 하고 있으므로, 하나라도 실패하면 전체 롤백됨
                  // PMMASTER DELETE
                  await pmmasterMultiDeleteSql(selectedIds);

                  // SCHEDULE DELETE
                  await scheduleMultiDeleteSql(selectedIds);

                  // ALARM DELETE
                  await alarmMultiDeleteSql(selectedIds);
                });
    
                // DB 삭제가 완벽히 성공한 후에만 UI 상태 업데이트
                setScheduleList(prev =>
                  prev.filter(item => !selectedIds.includes(item.pmid)) // 선택된 항목 제외하고 다시 설정
                );
                setSelectedIds([]);
    
              } catch (error) {
                console.error("삭제 트랜잭션 오류:", error);
                Alert.alert("에러", "삭제 중 오류가 발생하여 중단되었습니다.");
              }
            },
          },
        ]  
      );
    };

    // Schedule Delete PopUp Closez
    const handleCloseDelete = () => {
      router.back(); // 현재 모달 닫기
    };

    return (
      <View style={styles.containerze}>  
      {/* 검색 */}
        <View style={styles.serchst}> 
          <View style={styles.itemft}>
            <Checkbox style={styles.checkbox}
                      value={isAllSelected}
                      onValueChange={toggleAll}
            />
            <Text style={styles.textel}>
              전체 선택 ({selectedIds.length}/{scheduleList.length})
            </Text>
          </View>
          <Button label="삭제" 
                  onPress={handleDelete} 
                  //icon={"magnify"} 
                  isFormValid={selectedIds.length > 0 ? false : true} 
                  widthSize={0.20} 
                  heightSize={0.05}
                  fontSize={12}/>
          <Button label="닫기" 
                  onPress={handleCloseDelete} 
                  //icon={"pencil"} 
                  isFormValid={false} 
                  widthSize={0.20} 
                  heightSize={0.05}
                  fontSize={12}/>
        </View>     
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

export default ScheduleDelete;