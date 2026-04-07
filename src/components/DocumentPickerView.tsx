/**
 * 문서 보기
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { DocumentData, DocumentPickerViewProp } from '@/src/utils/types';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'; // 선택 아이콘을 위해 expo vector icons 사용
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View
} from 'react-native';
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';

const DocumentPickerView = (props: DocumentPickerViewProp) => {
  const { styles, colors } = useTheme();
  const {documentSelectSql, documentDeleteSql} = useDatabase() as any; // Select SQL
  const [documents, setDocuments] = useState<DocumentData[]>([]); // 문서 Data
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // 문서 선택 Data  
  const [currentDocument, setCurrentDocument] = useState<string | null | undefined>(undefined); // Pdf 문서
  const [textContent, setTextContent] = useState<string | null>(null); // TXT 파일
  const [visible, setIsVisible] = useState(false); // 모달 표시 여부    
  const [loading, setLoading] = useState(false); // 문서 로딩 상태
  const colorScheme = useColorScheme();
  const [downloadProgress, setDownloadProgress] = useState(0); // 다운로드 진행률
  const [isDownloading, setIsDownloading] = useState(false); // 다운로드 상태

  const backgroundColor = colorScheme === 'dark' ? colors.black : colors.white; 

  const getIcon = (uri: string | null | undefined) => {
    const lower = uri?.toLowerCase(); // 확장자 소문자 변환
  
    if (lower?.endsWith('.pdf')) return 'file-pdf-box';
    if (lower?.endsWith('.doc') || lower?.endsWith('.docx')) return 'file-word-box';
    if (lower?.endsWith('.xls') || lower?.endsWith('.xlsx')) return 'file-excel-box';
    if (lower?.endsWith('.ppt') || lower?.endsWith('.pptx')) return 'file-powerpoint-box';
    if (lower?.endsWith('.txt')) return 'file-document-outline';
    if (lower?.endsWith('.hwp')) return 'file';
    
    return 'file-document-outline';
  };

  // 문서 목록 설정
  const handleSetData = async () => {
    setDocuments(props.documents);
  };

  // 문서 Data Set
  useEffect(() => {
    handleSetData();
  }, [props.documents]);

  // SQLite에서 문서 목록 Select(목록 새로고침)
  const handleFetchData = async () => {
    const rows = await documentSelectSql(props.pmid);
    setDocuments(rows);
  };

  // 삭제_문서 선택/해제 토글 함수
  const toggleSelect = (id: number) => {
    setSelectedIds(prevIds => {
      if (prevIds.includes(id)) { // 배열 내 특정 요소의 존재 여부를 확인 : true / false
        // 이미 선택된 항목이면 제거
        return prevIds.filter(uriId => uriId !== id);
      } else {
        // 선택되지 않은 항목이면 추가
        return [...prevIds, id];
      }
    });
  };

  // 확대_문서를 터치했을 때 호출할 함수
  const handleDocumentPress = async (uri: string | null | undefined) => {
    if ( ! uri) return;  
    const lower = uri.toLowerCase();
  
    // PDF → 내부 보기
    if (lower.endsWith('.pdf')) { 
      setCurrentDocument(uri);
      setTextContent(null);
      setIsVisible(true);
      setLoading(true);
      return;
    }
  
    // TXT → 내부 보기 (옵션)
    if (lower.endsWith('.txt')) {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB      
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if ( ! fileInfo.exists) {
        Alert.alert("오류", "파일이 존재하지 않습니다.");
        return;
      }
      if (fileInfo.size && fileInfo.size > MAX_SIZE) {
        Alert.alert("알림", "파일이 너무 큽니다 (10MB 이하만 지원)");
        return;
      }

      setTextContent("");
      setIsVisible(true); // 먼저 열고
      setLoading(true);   // 로딩 유지 

      try {        
        const content = await FileSystem.readAsStringAsync(uri); // TXT 내용을 저장
        setTextContent(content);
        setCurrentDocument(null);
        return;
      } catch (e) {
        setIsVisible(false);
        Alert.alert("오류", "텍스트 파일을 읽을 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
  
    // 나머지 → 외부 앱으로 열기
    try {
      const fileName = uri.split('/').pop();

      Alert.alert(
        "외부 앱 실행",
        `${fileName} 파일을 외부 앱에서 엽니다.`,
        [
          { text: "취소", style: "cancel" },
          {
            text: "확인",
            onPress: async () => {
              try {
                // 공유(열기) 기능이 사용 가능한지 확인
                const isAvailable = await Sharing.isAvailableAsync();                
                if (isAvailable) {
                  // 파일 열기 실행 (기존 showOpenWithDialog와 동일한 효과)
                  await Sharing.shareAsync(uri, {
                    dialogTitle: '파일 열기', // 안드로이드용 팝업 제목
                    mimeType: '*/*', // 파일 형식에 맞춰 수정
                  });
                } else {
                  Alert.alert("오류", "이 기기에서는 파일을 열 수 없습니다.");
                }
              } catch (e) {
                console.error(e);
                Alert.alert("오류", "파일을 열 수 있는 앱이 없거나 실행에 실패했습니다.");
              }
            }
          }
        ]
      );
    } catch (e) {
      Alert.alert("오류2", "파일을 열 수 있는 앱이 없습니다.");
    }
  };
 
  // FlatList 렌더링 아이템 (각 문서 카드)
  const renderItem = ({ item }: { item: DocumentData }) => {
    const isSelected = selectedIds.includes(item.id); // 배열 내 특정 요소의 존재 여부를 확인 : true / false
    return (
      <Pressable onPress={() => handleDocumentPress(item.uri)} // 짭게 터치시(확대)
                 onLongPress={() => toggleSelect(item.id)}  // 길게 터치시(삭제)             
                 delayLongPress={1000} // 1초 설정
                 style={({ pressed }) => [ // pressed 상태를 사용하여 동적 스타일 적용
                   styles.imageWrapper,
                   isSelected && styles.selectedBorder, // 선택 시 테두리 표시                   
                   { opacity: pressed ? 0.8 : 1 } // activeOpacity={0.8} 대신 pressed 상태일 때 opacity를 0.8로 설정
                 ]}
      >
      <View style={styles.docItem}>
        <MaterialCommunityIcons name={getIcon(item.uri)} size={32} color={colors.vividBlueBackground} />
        <Text numberOfLines={1} style={styles.docText}>
          {item.name ?? item.uri?.split('/').pop() ?? '문서'} {/* pop() : 배열에서 맨 마지막 항목을 꺼냄 */}
        </Text>
      </View>
      {isSelected && (
        <View style={styles.selectionOverlay}>
          <AntDesign name="check-circle" size={24} color={colors.vividBlueBackground} />
        </View>
      )}
    </Pressable>
    );
  };

  // 삭제 버튼 핸들러
  const handleDelete = async () => {
     if (selectedIds.length === 0) {
        Alert.alert("알림", "선택된 문서가 없습니다.");
        return;
    }    
    Alert.alert(
      "삭제 확인", 
      `선택된 ${selectedIds.length}개의 문서를 영구적으로 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        { text: "확인", 
          onPress: async () => {
            try {
              // 선택된 문서들의 실물 파일 경로(URI) 가져오기(삭제대상)
              const documentsToDelete = documents.filter(document => selectedIds.includes(document.id));

              // FileSystem을 사용하여 물리적 파일 삭제(병렬삭제)
              // 여러 개의 비동기 작업(Promise)을 동시에(병렬로) 실행하고, 그 결과가 모두 나올 때까지 기다림
              await Promise.all(
                documentsToDelete.map(async (document) => {
                  if (document.uri) {
                    const fileInfo = await FileSystem.getInfoAsync(document.uri);
                    if (fileInfo.exists) await FileSystem.deleteAsync(document.uri); // 문서삭제
                  }
                })
              );
              // SQLite에서 DB 데이터 삭제
              await documentDeleteSql(selectedIds);

              // 상태 초기화 및 리로드
              setSelectedIds([]); // 문서 선택 Data 초기화
              handleFetchData(); // 목록 새로고침
              
              Alert.alert("알림", "선택한 문서가 삭제되었습니다.");
            } catch (error) {
              console.error("삭제 중 오류:", error);
              Alert.alert("오류", "문서 삭제 중 문제가 발생했습니다.");
            }
          } 
        }
      ]
    );
  };

  // 문서보기 PopUp Close
  const handleClose = () => {
    props.setDocumentIsOpen(false);
  };

  // Modal PopUp Close
  const handleModalClose = () => {
    setIsVisible(false);
    setCurrentDocument(null);
    setTextContent(null);
    setLoading(false);
  };

  // 파일명 추출
  const getFileName = (uri: string) => {
    return uri.split('/').pop() || `file_${Date.now()}`;
  };

  // SAF 폴더 권한 요청 (Download 선택)
  const getDownloadDir = async () => {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();  
    if ( ! permissions.granted) {
      throw new Error('폴더 권한이 거부되었습니다.');
    }
  
    return permissions.directoryUri; // 선택된 폴더 URI 반환
  };

  // SAF 파일 존재 체크
  const fileExistsSAF = async (dirUri: string, fileName: string) => {
    try {
      const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(dirUri); // SAF 폴더 내 파일 목록 읽기
      return files.some((fileUri) => fileUri.includes(fileName)); // 파일명 포함 여부로 체크 (true/false)
    } catch {
      return false;
    }
  };

  // SAF 파일 저장
  const saveToDownload = async (
    sourceUri: string,
    fileName: string,
    dirUri: string
  ) => {
    // 원본 존재 확인
    const sourceInfo = await FileSystem.getInfoAsync(sourceUri);
    if ( ! sourceInfo.exists) return;
  
    // 중복 체크
    const exists = await fileExistsSAF(dirUri, fileName);
    if (exists) {
      console.log(`중복 스킵: ${fileName}`);
      return 'skipped';
    }
  
    // 원본 base64 변환
    const fileData = await FileSystem.readAsStringAsync(sourceUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  
    // 새로운 파일 생성
    const newFileUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        dirUri,
        fileName,
        'application/octet-stream'
      );
  
    // 쓰기
    await FileSystem.writeAsStringAsync(newFileUri, fileData, {
      encoding: FileSystem.EncodingType.Base64,
    });
  
    return 'saved';
  };

  // 다운로드 버튼 핸들러
  const handleDownload = async () => {
    if (selectedIds.length === 0) {
      Alert.alert("알림", "선택된 문서가 없습니다.");
      return;
    }
  
    Alert.alert(
      "다운로드 확인",
      `선택된 ${selectedIds.length}개의 문서를 지정한 폴더에 저장하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: async () => {
            try {
              setIsDownloading(true); // 다운로드 상태 시작
              setDownloadProgress(0); // 다운로드 진행률 초기화
  
              // Download 폴더 선택 (최초 1회)
              const dirUri = await getDownloadDir();
  
              // 다운로드 대상 문서
              const documentsToDownload = documents.filter(doc => selectedIds.includes(doc.id));
  
              let completed = 0;
  
              for (const doc of documentsToDownload) {
                try {
                  if ( ! doc.uri) continue;
  
                  const fileName = getFileName(doc.uri); // 파일명 추출
  
                  // SAF 파일 저장
                  const result = await saveToDownload( 
                    doc.uri,
                    fileName,
                    dirUri
                  );
  
                  // saved / skipped 둘 다 진행률 포함
                  if (result) {
                    completed++;
                    setDownloadProgress(completed / documentsToDownload.length);
                  }
                } catch (err) {
                  console.error("다운로드 오류:", err);
                }
              }
  
              setIsDownloading(false);
              setSelectedIds([]); // 다운로드 후 선택 초기화
  
              Alert.alert("완료", "문서가 폴더에 저장되었습니다.");
            } catch (e) {
              console.error(e);
              setIsDownloading(false);
              Alert.alert("오류", "다운로드 중 문제가 발생했습니다.");
            }
          },
        },
      ]
    );
  }; 

  return (
    <View style={styles.containereh}>
      <View style={styles.headersn}>
        <Text style={styles.headerText}>
          문서 ({selectedIds.length}개 선택됨)
        </Text>        
      </View>  
      <View style={styles.buttonsh}>        
        {selectedIds.length > 0 && (
          <>
            <Button label="문서다운로드" 
                    onPress={handleDownload} 
                    //icon={"image"} 
                    isFormValid={false} 
                    widthSize={0.30} 
                    heightSize={0.055}
                    fontSize={14}/>
            <Button label="문서삭제" 
                    onPress={handleDelete} 
                    //icon={"image"} 
                    isFormValid={false} 
                    widthSize={0.24} 
                    heightSize={0.055}
                    fontSize={14}/>        
          </>
        )}
        <Button label="닫기" 
                onPress={handleClose} 
                //icon={"door-closed"} 
                isFormValid={false} 
                widthSize={0.20} 
                heightSize={0.055}
                fontSize={14}/>        
      </View>   
      <View style={styles.content}>
        {/* 갤러리 List 보기 */}
        <FlatList<DocumentData>
          data={documents}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3} // 3열 격자 레이아웃
          contentContainerStyle={styles.listContainer}
          extraData={selectedIds} // selectedIds 변경 시 FlatList 항목 리렌더링 유도
        />
        {/* 다운로드 진행률 */}
        {isDownloading && (
          <View style={styles.downloadProgress}>
            <Text>다운로드 진행률: {(downloadProgress * 100).toFixed(0)}%</Text>
            <View style={styles.downloadProgressst}>
              <View style={[styles.downloadProgresssn, {width: `${downloadProgress * 100}%`}]}/>
            </View>
          </View>
        )}
        {/* 문서 보기 모달 */}
        <Modal 
          visible={visible} 
          animationType="slide"
          onRequestClose={handleModalClose} // Android 뒤로가기 버튼 처리
        >
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor}} 
                        edges={['top', 'bottom']}>
            <View style={{ flex: 1 }}>
              <View style={styles.buttonsh}>
                <Button label="닫기" 
                        onPress={handleModalClose} 
                        //icon={"door-closed"} 
                        isFormValid={false} 
                        widthSize={0.20} 
                        heightSize={0.055}
                        fontSize={14}/>  
              </View>          
              {/* PDF */}
              {currentDocument ? (                  
                <Pdf 
                  source={{ uri: currentDocument }} 
                  style={{ flex: 1, backgroundColor: backgroundColor }} 
                  onLoadComplete={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setIsVisible(false);
                    setCurrentDocument(null);
                    Alert.alert("오류", "PDF 로드 실패");
                  }}
                />
              ) : textContent ? ( // TEXT
                <ScrollView style={{ flex: 1, padding: 16 }}>
                  <Text style={[styles.docTextth, { color: colorScheme === 'dark' ? colors.white : colors.black }]}>
                    {textContent}
                  </Text>
                </ScrollView>
              ) : null}
  
              {loading && (
                <View style={styles.docTextst}>
                  <ActivityIndicator size="large" color={colorScheme === 'dark' ? colors.white : colors.black} />
                  <Text style={styles.docTextsn}>
                    문서 불러오는 중...
                  </Text>
                </View>
              )}            
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </View>      
  );
};

export default DocumentPickerView;