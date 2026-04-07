/**
 * Backup & Restore
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

const BackupRestore = () => {
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
                    <Text style={styles.menualHText}>백업/복원</Text>
                </View>
                <Text style={styles.menualSText}>개요</Text> 
                <Text style={styles.menualtext}>
                    본 작업은 기기변경 시 구 기기에 있던 자료를 신 기기로 옮기기 위한 작업이다.
                </Text>
                <Text style={styles.menualSText}>1.백업</Text>
                <Text style={styles.menualtext}>1.1. 현재 데이터 백업하기</Text>
                <Text style={styles.menualtext}>
                    1.1.1. 백업 작업은 구 기기에서 수행한다.{"\n"}
                    1.1.2. 버튼을 클릭하면 백업파일명과 백업매체가 조회된다.{"\n"}
                    1.1.3. 카톡이나 메일, 구글드라이브(Drive)등을 선택하여 백업파일을 보낸다.{"\n"}  
                    ※ 백업파일명 : full_backup.zip{"\n"}
                    ※ 백업매체 : 카톡, 메일, 구글 드라이브(Drive) 등                  
                </Text>
                <Text style={styles.menualSText}>2.복원</Text>
                <Text style={styles.menualtext}>2.1. 백업 파일에서 복원하기</Text>
                <Text style={styles.menualtext}>
                    2.1.1. 복원 작업은 신 기기에서 수행한다.{"\n"}
                    2.1.2. 구 기기에서 카톡, 메일, 구글 드라이브(Drive)등으로 보내놓은 백업파일을 신 기기로 다운로드 한다.{"\n"} 
                    2.1.3. 버튼을 클릭하면 데이터 복원 메세지 출력하고 확인을 클리하면 다운로드 폴더가 조회된다.{"\n"}
                    2.1.4. 백업파일을 선택하면 복원 실행하고 복원 완료 메세지가 출력되고 확인을 클리하면 앱을 재시작 한다.{"\n"}
                    ※ 백업파일 위치{"\n"}
                    ※ 카톡 : 핸드폰명/내장 저장공간/Download/KakaoTalk{"\n"} 
                    ※ 메일 : 핸드폰명/내장 저장공간/Download                
                </Text>
                <Text style={styles.menualSText}>3.참고</Text>
                <Text style={styles.menualtext}>3.1. 백업 매체 크기</Text>
                <Text style={styles.menualtext}>
                    3.1.1. 카톡 : 최대 300MB{"\n"}
                    3.1.2. Gmail : 최대 25MB{"\n"} 
                    2.1.3. 네이버: 최대 25MB{"\n"}
                    2.1.4. 다음: 최대 25MB{"\n"}
                    2.1.5. 구글 드라이브(Drive) : 용량 제한이 거의 없음(보통 15GB~50GB 이상){"\n"}
                    2.1.6. 마이크로소프트(OneDrive) : 5GB 무료            
                </Text>
            </View>
          </ScrollView>  
        </View>
    );
}

export default BackupRestore;