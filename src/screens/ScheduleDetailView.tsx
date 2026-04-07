/**
 * Schedule Data Detail View
 */

import Button from '@/src/components/Button';
import TelNoView from '@/src/components/TelNoView';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import ScreenFooter from '@/src/layouts/ScreenFooter';
import ScreenHeader from '@/src/layouts/ScreenHeader';
import ScreenLayout from '@/src/layouts/ScreenLayout';
import ScheduleRegist from '@/src/screens/ScheduleRegist';
import { ScheduleData, ScheduleDetailViewProp } from '@/src/utils/types';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Text,
  View,
  useColorScheme
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dropdown Data
const dropdownData = [
  { label: '미완료', value: 'N' },
  { label: '완료', value: 'S' },
  { label: '취소', value: 'C' },
];

const ScheduleDetailView = (props: ScheduleDetailViewProp) => {
  const { styles, colors } = useTheme();
  const { scheduleSelectSql, scheduleUpdateSql } = useDatabase() as any; // Select SQL
  const [scheduleList, setScheduleList] = useState<ScheduleData[]>([]); // DB Data
  const [registIsOpen, setRegistIsOpen] = useState(false); // 등록 Modal Popup
  const [registFlag, setRegistFlag] = useState<string>(''); // 추가 여부
  const [telNoIsOpen, setTelNoIsOpen] = useState(false); // TelNo Modal Open
  const router = useRouter(); // 경로
  const colorScheme = useColorScheme();
  
  const backgroundColor = colorScheme === 'dark' ? colors.black : colors.white;

  // Schedule Select
  const handleFetchData = async () => {
    const rows = await scheduleSelectSql(props.pmid);
    setScheduleList(rows);
  };

  // Schedule Select
  useEffect(() => {
    handleFetchData();
  }, [props.pmid, registIsOpen]);

  // Schedule Update
  const updateCompleteStatus = async (id: number, newStatus: string) => {
    await scheduleUpdateSql(id, newStatus, null);
    handleFetchData(); // 업데이트 후 목록을 새로고침
  };

  // 목록의 각 항목을 렌더링하는 함수
  const renderItem = ({ item }: { item: ScheduleData }) => (
    <View style={styles.todoItemst}>
      <View style={styles.textst}>
        <Text style={styles.textsh}>
          {item.contents}
        </Text>
      </View>
      <View style={styles.combo}>
        <Dropdown
          style={styles.dropdownst} // 테두리 등 스타일 지정
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText} // 여기가 선택된 글자 스타일
          maxHeight={200} // 리스트의 최대 높이를 200 정도로 제한
          dropdownPosition="auto" // 'auto', 'top', 'bottom' 중 선택
          data={dropdownData}
          labelField="label"
          valueField="value"
          value={item.complete}
          onChange={val => updateCompleteStatus(item.id, val.value)}
        />     
      </View> 
    </View>    
  );

  // 상세조회 PopUp Close
  const handleDetailView = () => {
      router.back(); // 현재 모달 닫기
  };

  // 추가 PopUp Open
  const handleScheduleRegist = () => {
      setRegistIsOpen(true);
      setRegistFlag("I");
  };

  // 전화번호 PopUp Open
  const handleTelNoView = () => {
      setTelNoIsOpen(true);
  };

  return (   
      <View style={styles.containerze}>
        <View style={styles.button}>
          <Button label="전화번호찾기" 
                  onPress={handleTelNoView} 
                  //icon={"magnify"} 
                  isFormValid={false} 
                  widthSize={0.34} 
                  heightSize={0.055}
                  fontSize={14}/>    
          <Button label="추가" 
                  onPress={handleScheduleRegist} 
                  //icon={"pencil"} 
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
        <View style={styles.content}>
          <FlatList<ScheduleData>
            ItemSeparatorComponent={() => <View style={styles.separator}/>} // 리스트 내의 각 항목 사이에 구분선을 렌더링하는 데 사용되는 속성
            data={scheduleList} // 화면에 표시할 리스트 아이템을 담고 있는 배열을 지정하는 필수 속성
            renderItem={renderItem} // 데이터 배열의 각 요소를 어떻게 렌더링할지 정의하는 콜백 함수
            keyExtractor={item => item.id.toString()} // 각 항목에 대한 고유한 키(React Key)를 생성하도록 지시하는 속성
            contentContainerStyle={{ paddingBottom: 50 }} // FlatList 자체에 하단 여백을 줌
          />
        </View>
        {/* 추가 */}
        <View>          
          <Modal visible={registIsOpen} 
                 onRequestClose={() => {setRegistIsOpen(false);}} // 모달 닫기 요청 처리 : 뒤로가기등
                 animationType='none'
                 transparent={false}
          >          
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor}} 
                          edges={['top', 'bottom']}>
              <ScreenLayout 
                header={<ScreenHeader title={"일정추가등록"} showBack={true} applyInset={true}/>} 
                footer={<ScreenFooter applyInset={true} />}
              >      
                 <ScheduleRegist pmid={props.pmid}
                                 registFlag={registFlag}
                 />
              </ScreenLayout>
            </SafeAreaView>           
          </Modal>
        </View>
        {/* TelNo Modal Open */}
        <View>         
          <Modal visible={telNoIsOpen}
                 onRequestClose={() => setTelNoIsOpen(false)}
                 animationType="fade" // 슬라이드보다 페이드가 팝업 느낌에 더 적합
                 transparent={true}
          >  
            <View style={styles.modalOverlay}>{/* 배경 레이어: 화면 전체를 반투명하게 덮음 */}  
              <View style={[styles.modalContent, {width: '80%', height: '50%'}]}>{/* 실제 팝업 컨텐츠: 중앙에 작게 위치 */}
                <TelNoView setTelNoIsOpen={setTelNoIsOpen} />
              </View>
            </View>
          </Modal>        
        </View>
      </View>
  );
}

export default ScheduleDetailView;