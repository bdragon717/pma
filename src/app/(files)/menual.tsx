/**
 * Menual
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';

const Menual = () => {
    const router = useRouter();
    const { title } = useLocalSearchParams<{ title: string }>();
    const { styles, colors } = useTheme(); 

    return (
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.headerfh}>
            <Pressable onPress={() => router.back()} 
                       hitSlop={20}
                       style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
               <Icon name="arrow-left" size={24} color={colors.black} />
            </Pressable>
              {/* Title */}
              <View style={styles.center}>
                <Text style={styles.titlest}>
                  {title}
                </Text>
              </View>
          </View>
          {/* 내용 */}
          <ScrollView style={{ flex: 1 }}
                      contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.content}>
              <View style={styles.menualHeader}>
                <Text style={styles.menualHText}>사용 설명서</Text>
              </View>
              <View>
                <Text style={styles.menualSText}>개요</Text> 
                <Text style={styles.menualtext}>
                  본 App는 개인관리로 기록, 일정, 금고, 전화 번호, 알람설정등 메뉴로 구성되어 있습니다.{"\n"}
                  기록은 과거 중요한 일들을 기록 관리한다.{"\n"}
                  일정은 미래 할 일들을 기록 관리한다.{"\n"}
                  금고는 비밀번호 등 기록 관리한다.
                </Text>
                <Text style={styles.menualSText}>0.공통</Text>
                <Text style={styles.menualtext}>0.1. 보기</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 조회조건을 입력할 수 있는 입력창이 열린다.
                </Text>
                <Text style={styles.menualtext}>0.2. 닫기</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 조회조건을 입력할 수 있는 입력창이 닫힌다.
                </Text>
                <Text style={styles.menualtext}>0.3. 로그인</Text>
                <Text style={styles.menualtext}>
                  아이디, 비밀번호를 입력하고 로그인 버튼을 클릭하여 로그인 한다.{"\n"}
                  [입력]{"\n"}
                  0.3.1. ID : ID 입력{"\n"}
                  0.3.2. 비밀번호 : 비밀번호 입력{"\n"}
                  ※ 비밀번호 5회 오류시 비밀번호 재등록 화면으로 이동한다.
                </Text>
                <Text style={styles.menualtext}>0.4. 로그아웃</Text>
                <Text style={styles.menualtext}>
                  화면 하단 오른쪽의 마이페이지 내 내정보 상단에 로그아웃 버튼을 클릭하여 로그아웃 한다.{"\n"}
                  로그인 화면으로 이동한다.
                </Text>
                <Text style={styles.menualtext}>0.5. 회원가입</Text>
                <Text style={styles.menualtext}>
                  로그인 화면에서 회원가입 버튼을 클릭하여 회원가입 한다.{"\n"}
                  [입력]{"\n"}
                  0.5.1. ID : ID 입력, 중복체크{"\n"}
                  0.5.2. 비밀번호 : 비밀번호 입력{"\n"}
                  0.5.3. 이름 : 공백없이 이름 입력{"\n"}
                  0.5.4. 전화번호 : "-" 없이 전화번호 입력{"\n"}
                  ※ 회원가입은 한번만 할 수 있다.
                </Text>
                <Text style={styles.menualtext}>0.6. 회원탈퇴</Text>
                <Text style={styles.menualtext}>
                  화면 하단 오른쪽의 마이페이지 내 내정보 상단에 회원탈퇴 버튼을 클릭하여 회원탈퇴 한다.{"\n"}
                  로그인 화면으로 이동한다.
                </Text>
                <Text style={styles.menualtext}>0.7. ID찾기</Text>
                <Text style={styles.menualtext}>
                  이름, 전화번호를 입력하고 조회 버튼을 클릭하면 ID가 조회 된다.{"\n"}
                  [입력]{"\n"}
                  0.7.1. 이름 : 공백없이 이름 입력{"\n"}
                  0.7.2. 전화번호 : "-" 없이 전화번호 입력
                </Text>
                <Text style={styles.menualtext}>0.8. 비밀번호찾기</Text>
                <Text style={styles.menualtext}>
                  ID, 이름, 전화번호를 입력하고 조회 버튼을 클릭하면 비밀번호가 조회 된다.{"\n"}
                  [입력]{"\n"}
                  0.8.1. ID : ID 입력{"\n"}
                  0.8.2. 이름 : 공백없이 이름 입력{"\n"}
                  0.8.3. 전화번호 : "-" 없이 전화번호 입력{"\n"}
                  ※ 눈 모양의 아이콘을 클리하면 숨겨진 내용이 보여진다.
                </Text>
                <Text style={styles.menualtext}>0.9. 비밀번호 변경요청</Text>
                <Text style={styles.menualtext}>
                  비밀번호 설정한지 3개월이 경과되면 비밀번호 변경요청 화면이 열린다.{"\n"}
                  [버튼]{"\n"}
                  0.9.1. 오늘 안보기 : 오늘 하루동안 비밀번호 변경요청 화면을 안띄운다.{"\n"}
                  0.9.2. 나중에 : 선택 이후 3개월 동안 비밀번호 변경요청 화면을 안띄운다.{"\n"}
                  0.9.3. 지금변경 : 비밀번호를 변경할 수 있는 화면으로 이동한다.
                </Text>
                <Text style={styles.menualtext}>0.10. 폴더 메뉴</Text>
                <Text style={styles.menualtext}>
                  폴더 또는 파일을 길게 누르면 폴더 메뉴 화면이 열린다.{"\n"}
                  [메뉴]{"\n"}
                  0.10.1. 이름변경 : 폴더명을 수정한다.{"\n"}
                  0.10.2. 이동 : 모든 폴더가 조회되며 조회된 폴더 중 특정 폴더를 선택하면 해당 폴더로 이동한다.{"\n"}
                  0.10.3. 취소 : 폴더 메뉴를 닫고 본 화면으로 이동한다.
                </Text>
                <Text style={styles.menualSText}>1.기록</Text>
                <Text style={styles.menualtext}>1.1. 조회</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 조회조건에 맞는 자료가 목록으로 조회된다.{"\n"}
                  [조회조건]{"\n"}
                  1.1.1. 년 : 년도 4자리 입력(예,2026){"\n"}
                  1.1.2. 월 : 월 2자리 입력(예,1~12){"\n"}
                  1.1.3. 일 : 일 2자리 입력(예,1~31){"\n"}
                  1.1.4. 제목 : 제목을 전부 또는 일부를 입력(예,계약)
                </Text>
                <Text style={styles.menualtext}>1.2. 쓰기</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 제목, 내용을 등록할 수 있는 화면이 열린다.{"\n"}
                  1.2.1. 제목 : 구별되는 제목을 입력(예,xxx 계약체결){"\n"}
                  1.2.2. 내용 : 자세하게 내용을 입력{"\n"}
                  1.2.3. 사진첨부 : 클릭시 캘러리 사진이 표시되고 선택 등록{"\n"}
                  ※ 첨부된 사진은 앱에서 별도 관리한다.{"\n"}
                    (갤러리와 별도로 관리 하므로 갤러리 사진은 삭제해도 됨){"\n"}
                  1.2.4. 문서첨부 : 클릭시 다운로드 폴더의 사진이 표시되고 선택 등록{"\n"}
                  ※ 문서종류 : 텍스트, PDF, 엑셀, 워드, PPT, 아래한글등.{"\n"}
                  ※ 첨부된 문서는 앱에서 별도 관리한다.{"\n"}
                    (다운로드 폴더와 별도로 관리 하므로 다운로드 폴더 문서은 삭제해도 됨){"\n"}
                  1.2.5. 저장 : 클릭시 해당 자료를 저장하고 목록 화면으로 이동한다.
                </Text>
                <Text style={styles.menualtext}>1.3. 폴더</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 폴더 등록할 수 있는 팝업 화면이 열린다.{"\n"}
                  1.3.1. 폴더명을 입력{"\n"}
                  1.3.2. 확인 : 버튼을 클릭하면 입력된 폴더가 저장된다.{"\n"}
                  1.3.3. 취소 : 버튼을 클릭하면 저장하지 않고 팝업 화면이 사라진다.
                </Text>
                <Text style={styles.menualtext}>1.4. 기록상세조회</Text>
                <Text style={styles.menualtext}>
                  조회된 목록 중 특정 자료를 선택하면 상세 내용을 볼 수 있는 화면이 열린다.{"\n"}
                  1.4.1. 사진보기 : 사진을 첨부 하였으면 해당 버튼이 보이고 클릭하여 사진을 볼 수 있다.{"\n"}
                  1.4.2. 문서보기 : 문서를 첨부 하였으면 해당 버튼이 보이고 클릭하여 문서를 볼 수 있다.{"\n"}
                  1.4.3. 수정 : 수정 버튼을 클릭하면 화면이 활성화 되고 내용을 수정할 수 있다.{"\n"}
                  1.4.4. 삭제 : 삭제 버튼을 클릭하면 해당 내용을 삭제 한다.{"\n"}
                  1.4.5. 닫기 : 버튼을 클릭하면 목록 화면으로 이동한다.
                </Text>
                <Text style={styles.menualtext}>1.5. 사진보기</Text>
                <Text style={styles.menualtext}>
                  1.5.1. 짧게클릭 : 확대된 사진을 볼 수 있다.{"\n"}
                  1.5.2. 길게클릭 : 선택표시되고 사진삭제 버튼이 나타난다.{"\n"}
                  1.5.3. 사진삭제 : 버튼을 클릭하면 선택된 사진이 삭제된다.{"\n"}
                  1.5.4. 사진다운로드 : 버튼을 클릭하면 선택된 사진이 다운로드된다.{"\n"}
                  ※ 다운로드된 사진은 갤러리에서 볼 수 있다.{"\n"}
                  ※ 다운로드된 사진 폴더 : PMADownloads{"\n"}
                  1.5.5. 닫기 : 버튼을 클릭하면 상세조회 화면으로 이동한다.
                </Text>
                <Text style={styles.menualtext}>1.6. 문서보기</Text>
                <Text style={styles.menualtext}>
                  1.6.1. 짧게클릭 : 확대된 문서을 볼 수 있다.{"\n"}
                  1.6.2. 길게클릭 : 선택표시되고 문서삭제 버튼이 나타난다.{"\n"}
                  1.6.3. 문서삭제 : 버튼을 클릭하면 선택된 문서가 삭제된다.{"\n"}
                  1.6.4. 문서다운로드 : 버튼을 클릭하면 선택된 문서가 다운로드된다.{"\n"}
                  ※ 최초 다운로드
                    - 위치와 폴더를 직접 생성해야 한다.{"\n"}
                    - 조회된 폴더 중 Download 폴더를 선택한다.{"\n"}
                    - 상단의 파란색 "새 폴더 만들기" 버튼을 클릭하여 폴더를 생성한다.{"\n"}
                    - 폴더 이름을 PMADownloads로 입력하여 생성한다.{"\n"}
                    - 하단의 파란색 "이 폴더 사용" 버튼을 클릭한다.{"\n"}
                    - 허용 여부를 물으며 허용을 클릭하면 다운로드가 된다.{"\n"}
                  ※ 이 후 다운로드  
                    - 자동으로 Download/PMADownloads 폴더로 이동한다.{"\n"}
                    - 하단의 파란색 "이 폴더 사용" 버튼을 클릭한다.{"\n"}
                    - 허용 여부를 물으며 허용을 클릭하면 다운로드가 된다.{"\n"}
                  ※ 권장 폴더 : Downloas/PMADownloads{"\n"}
                  1.6.5. 닫기 : 버튼을 클릭하면 상세조회 화면으로 이동한다.
                </Text>
                <Text style={styles.menualSText}>2.일정</Text>
                <Text style={styles.menualtext}>2.1. 조회</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 조회조건에 맞는 자료가 목록으로 조회된다.{"\n"}
                  여기에 조회되는 자료은 일정 중 처움 입력한 일정이다.{"\n"}
                  [조회조건]{"\n"}
                  2.1.1. 년 : 년도 4자리 입력(예,2026){"\n"}
                  2.1.2. 월 : 월 2자리 입력(예,1~12){"\n"}
                  2.1.3. 일 : 일 2자리 입력(예,1~31){"\n"}
                  2.1.4. 상태 : 전체, 미완료, 완료 중 선택(기본:미완료)
                </Text>
                <Text style={styles.menualtext}>2.2. 쓰기</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 일정을 등록할 수 있는 화면이 열린다.{"\n"}
                  2.2.1. 일자선택 : 달력이 팝업되며 일자를 선택한다.{"\n"}
                  2.2.2. 알람 : 시/분을 입력(기본:09:00){"\n"}
                  2.2.3. 내용 : 일정을 입력{"\n"}
                  2.2.4. 추가 : 버튼을 클릭하여 게속 입력{"\n"}
                  2.2.5. 저장 : 클릭시 해당 자료를 저장하고 목록 화면으로 이동한다.{"\n"}
                  ※ 주의 : 년월일 시분이 지나면 등록 불가하다.
                </Text>
                <Text style={styles.menualtext}>2.3. 일정상세조회</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 등록된 일정을 볼 수 있는 화면이 열리고 개별 일정을 처리할 수 있다.{"\n"}
                  2.3.1. 일정처리 : 우측에 콤보박스로 미완료, 완료, 취소 중 선택(기본:미완료){"\n"}
                  2.3.2. 추가 : 일정을 추가로 등록할 수 있는 화면이 열리고 일정을 입력{"\n"}
                  2.3.3. 전화번호찾기 : 전화번호찾기가 팝업되며 이름으로 전화번호를 찾는다.{"\n"}
                  ※ 찾아진 번호를 짧게 누르면 전화를 길게 누르면 문자를 보내는 화면으로 이동한다.{"\n"}
                  2.3.4. 닫기 : 버튼을 클릭하여 목록 화면으로 이동한다.
                </Text>
                <Text style={styles.menualtext}>2.4. 삭제</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 완료된 일정을 삭제할 수 있는 화면이 열린다.{"\n"}
                  2.4.1. 전체선택 : 완료된 일정을 모두 선택한다.{"\n"}
                  2.4.2. 개별선택 : 완료된 일정 중 특정 일정을 선택한다.{"\n"}
                  2.4.3. 삭제 : 버튼을 클릭하면 선택된 일정이 삭제된다.{"\n"}
                  2.4.4. 닫기 : 현재 화면을 닫고 목록 화면으로 이동한다.
                </Text>
                <Text style={styles.menualSText}>3.금고</Text>
                <Text style={styles.menualtext}>3.1. 인증</Text>
                <Text style={styles.menualtext}>
                  본 화면은 아이디, 비밀번호등을 관리하는 금고로 인증이 필요하다.{"\n"}
                  버튼을 클릭하면 최초 등록시에는 인증등록 화면이 열리고 이 후에는 인증확인이 팦업된다.
                </Text>
                <Text style={styles.menualtext}>3.2. 인증등록</Text>
                <Text style={styles.menualtext}>
                  최초 인증을 등록할 수 있는 화면이 열린다.{"\n"}
                  3.2.1. 이름 : 이름을 공백없이 입력(예,홍길동){"\n"}
                  3.2.2. 전화번호 : 전화번호를 '-''없이 숫자만 입력(예,01012341234){"\n"}
                  3.2.3. 인증키 : 본인만 알 수 있는 영숫자 입력(예,abc1234){"\n"}
                  2.2.5. 저장 : 클릭시 해당 자료를 저장하고 목록 화면으로 이동한다.{"\n"}
                  ※ 이름, 전화번호는 추 후 인증키 분실시 초기화 하기 위해 사용
                </Text>  
                <Text style={styles.menualtext}>3.3. 인증확인</Text>
                <Text style={styles.menualtext}>
                  인증확인이 팝업되고 이증키를 넣어 허가된 경우만 사용 가능하다.{"\n"}
                  3.3.1. 인증키 : 인증등록에서 등록한 인증키를 입력(예,abc1234){"\n"}
                  3.3.2. 확인 : 등록된 인증이 맞으면 목록 화면으로 이동, 틀리면 메세지 출력한다.{"\n"}
                  3.3.3. 취소 : 버튼을 클릭하면 저장하지 않고 팝업 화면이 사라진다.{"\n"}
                  3.3.4. 초기화 : 인증키 분실시 클릭하면 인증등록 화면이 열리고 이름, 전화번호가 맞으면 새로운 인증키를 등록할 수 있다.
                </Text>
                <Text style={styles.menualtext}>3.4. 조회</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 조회조건에 맞는 자료가 목록으로 조회된다.{"\n"}
                  [조회조건]{"\n"}
                  3.4.1. 제목 : 제목을 전부 또는 일부를 입력(예,계약)
                </Text>
                <Text style={styles.menualtext}>3.5. 쓰기</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 제목, 내용을 등록할 수 있는 화면이 열린다.{"\n"}
                  3.5.1. 제목 : 포털등 제목을 입력(예,네이버){"\n"}
                  3.5.2. 내용 : 아이디, 비밀번호등 내용을 입력(예,id:abc123, password:1234){"\n"}
                  3.5.4. 저장 : 클릭시 해당 자료를 저장하고 목록 화면으로 이동한다.
                </Text>
                <Text style={styles.menualtext}>3.6. 폴더</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 폴더 등록할 수 있는 팝업 화면이 열린다.{"\n"}
                  3.6.1. 폴더명을 입력{"\n"}
                  3.6.2. 확인 : 버튼을 클릭하면 입력된 폴더가 저장된다.{"\n"}
                  3.6.3. 취소 : 버튼을 클릭하면 저장하지 않고 팝업 화면이 사라진다.
                </Text>
                <Text style={styles.menualtext}>3.7. 비밀상세조회</Text>
                <Text style={styles.menualtext}>
                  조회된 목록 중 특정 자료를 선택하면 상세 내용을 볼 수 있는 화면이 열린다.{"\n"}
                  3.7.1. 수정 : 수정 버튼을 클릭하면 화면이 활성화 되고 내용을 수정할 수 있다.{"\n"}
                  3.7.2. 삭제 : 삭제 버튼을 클릭하면 해당 내용을 삭제 한다.{"\n"}
                  3.7.3. 닫기 : 버튼을 클릭하면 목록 화면으로 이동한다.
                </Text>
                <Text style={styles.menualSText}>4.전화번호</Text>
                <Text style={styles.menualtext}>4.1. 조회</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 조회조건에 맞는 이름과 전화번호가 목록으로 조회된다.{"\n"}                  
                  [조회조건]{"\n"}
                  4.1.1. 이름 : 전체 또는 한글자만 입력(예, 홍길동 또는 홍){"\n"}
                  [전화번호]{"\n"}
                  4.1.2. 짧게클릭 : 전화를 걸 수 있는 화면으로 이동한다.{"\n"}
                  4.1.3. 길게클릭 : 문자를 보낼 수 있는 화면으로 이동한다.                
                </Text>
                <Text style={styles.menualSText}>5.알람설정</Text>
                <Text style={styles.menualtext}>5.1. 조회</Text>
                <Text style={styles.menualtext}>
                  버튼을 클릭하면 조회조건에 맞는 자료가 목록으로 조회된다.{"\n"}
                  여기에 조회되는 자료은 일정 중 처움 입력한 일정이다.{"\n"}                  
                  [조회조건]{"\n"}
                  5.1.1. 이름 : 전체 또는 한글자만 입력(예, 홍길동 또는 홍)     
                </Text>
                <Text style={styles.menualtext}>5.2. 추가</Text>
                <Text style={styles.menualtext}>
                  조회된 자료 중 하나를 선택하고 버튼을 클릭하면 알람추가 팝업 화면이 열린다.{"\n"}
                  해당 일정에 알람 시간을 추가한다.{"\n"}
                  5.2.1. 시 : 시간을 입력(예, 1~24){"\n"} 
                  5.2.2. 분 : 분을 입력(예, 1~60){"\n"}
                  5.2.3. 저장 : 버튼을 클릭하면 입력된 알람이 저장된다.{"\n"}
                  5.2.4. 취소 : 버튼을 클릭하면 저장하지 않고 팝업 화면이 사라진다.    
                </Text>
                <Text style={styles.menualtext}>5.3. 수정</Text>
                <Text style={styles.menualtext}>
                  조회된 자료 중 하나를 선택하고 버튼을 클릭하면 알람수정 화면이 하단에 열린다.{"\n"}
                  해당 일정에 알람 시간을 ON/OFF 한다.{"\n"}
                  5.3.1. ON : 알람을 켠다.{"\n"} 
                  5.3.2. OFF : 알람을 끈다.    
                </Text>
                <Text style={styles.menualtext}>5.4. 삭제</Text>
                <Text style={styles.menualtext}>
                  조회된 자료 중 하나를 선택하고 버튼을 클릭하면 알람삭제 팝업 화면이 열린다.{"\n"}
                  5.4.1. 삭제 : 버튼을 클릭하면 삭제 여부를 묻고, 삭제를 클릭하면 삭제된다.
                </Text>
                <Text style={styles.menualSText}>6.홈</Text>
                <Text style={styles.menualtext}>
                  화면 하단의 읜쪽 홈 버튼을 클릭하면 홈(기록) 화면으로 이동한다.
                </Text>
                <Text style={styles.menualSText}>7.파일</Text>
                <Text style={styles.menualtext}>
                  화면 하단의 중앙 파일 버튼을 클릭하면 고객센터 화면이 열린다.
                </Text>
                <Text style={styles.menualSText}>8.마이페이지</Text>
                <Text style={styles.menualtext}>
                  화면 하단의 오른쪽 마이페이지 버튼을 클릭하면 마이페이지 화면이 열린다.
                </Text>
                <Text style={styles.menualtext}>
                  조회된 메뉴 중 오른쪽 {">"}를 클릭하면 내용 화면이 열린다.{"\n"}
                  메뉴 화면에서 상단의 {"<-"}를 클릭하면 고객센터 또는 마이페이지 화면으로 이동한다.
                </Text>
              </View>
            </View>
          </ScrollView>  
        </View>
    );
}

export default Menual;