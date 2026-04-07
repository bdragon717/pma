/**
 * Remember Data Detail View
 */

import Button from '@/src/components/Button';
import DocumentPickerView from '@/src/components/DocumentPickerView';
import ImagePickerView from '@/src/components/ImagePickerView';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { DocumentData, PictureData, RememberDetailViewProp } from '@/src/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as FileSystem from 'expo-file-system/legacy';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import {
  Alert,
  Modal,
  Text,
  TextInput,
  useColorScheme,
  View
} from 'react-native';
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const inputSchema = z.object({
  contents: z.string()
             .min(1, { message: "contents를 입력하세요." }) // 최소 1글자 이상
             .refine((val) => val.trim() !== "", "contents를 입력하세요."), // 공백 체크
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputFormValues = z.infer<typeof inputSchema>;

const RememberDetailView = (props: RememberDetailViewProp) => {
  // useForm에 스키마 주입 및 타입 설정
  const { control, handleSubmit, reset, formState: { isValid, errors } } = useForm<InputFormValues>({
    resolver: zodResolver(inputSchema),
    mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
    defaultValues: {
      contents: '',
    },
  });

  const { styles, colors } = useTheme();  
  const [pictureIsOpen, setPictureIsOpen] = useState(false); // 사진보기 Modal Popup
  const [documentIsOpen, setDocumentIsOpen] = useState(false); // 문서보기 Modal Popup
  const { dbRef, 
          pictureSelectSql,
          documentSelectSql,
          pmmasterUpdateSql,
          pmmasterDeleteSql, 
          pictureSingleDeleteSql, 
          documentSingleDeleteSql } = useDatabase() as any; // SQL
  const [images, setImages] = useState<PictureData[]>([]); // 사진 Data
  const [documents, setDocuments] = useState<DocumentData[]>([]); // 문서 Data
  const [isEditable, setIsEditable] = useState(false); // Update 활성/비활성화
  const colorScheme = useColorScheme();
  //const router = useRouter(); // 경로  

  const backgroundColor = colorScheme === 'dark' ? colors.black : colors.white;

  // SQLite에서 사진 목록 Select
  const handleImageFetchData = async () => {
    const rows = await pictureSelectSql (props.pmid);
    setImages(rows);
  };

  // SQLite에서 문서 목록 Select
  const handleDocumentFetchData = async () => {
    const rows = await documentSelectSql (props.pmid);
    setDocuments(rows);
  };

  // 초기 Data Select
  useEffect(() => {
    // 부모로부터 전달된 값을 react-hook-form에 수동으로 넣어줌.
    if (props.contents) {
      reset({ contents: props.contents }); 
    }    
    //사진 및 문서 Data Select
    handleImageFetchData();
    handleDocumentFetchData();
  }, [props.pmid, reset]);

  // 사진보기 PopUp Open 
  const handleImagePicker = () => {
    setPictureIsOpen(true);
  };

  // 문서보기 PopUp Open
  const handleDocumentPicker = () => {
    setDocumentIsOpen(true);
  };

  // 상세조회 Close
  const handleDetailCLose = () => {
    props.setDetailViewIsOpen?.(false);
    //router.back(); // 현재 모달 닫기
  };

  // Remember Delete
  const handleDeleteData = async () => {
    Alert.alert(
      "삭제 확인", // 제목
      "정말로 이 항목을 삭제 하시겠습니까?", // 메시지
      [
        {
          text: "취소",
          style: "cancel" // iOS에서 굵은 글씨로 취소 강조
        },
        { 
          text: "삭제", 
          onPress: async () => {
            if ( ! dbRef.current) {
              Alert.alert("에러", "데이터베이스 연결이 없습니다.");
              return;
            }

            try { 
              // DB 삭제
              // 트랜잭션 시작
              await dbRef.current.withTransactionAsync(async () => {
                // 내부 함수들이 에러를 던지면(throw) 자동으로 롤백됨. 
                // PICTURE DELETE
                if (images.length > 0) {          
                  await pictureSingleDeleteSql(props.pmid); 
                }
                // DOCUMENT DELETE
                if (documents.length > 0) {
                  await documentSingleDeleteSql(props.pmid);
                }
                // PMMASTER DELETE
                await pmmasterDeleteSql(props.pmid);
              });

              // 물리적 파일 삭제 (사진 및 문서)
              // 사진 삭제
              if (images.length > 0) {
                await Promise.all(
                  images.map(async (image) => {
                    if (image.uri) {
                      const fileInfo = await FileSystem.getInfoAsync(image.uri);
                      if (fileInfo.exists) await FileSystem.deleteAsync(image.uri);
                    }
                  })
                );
              }
              // 문서 삭제
              if (documents.length > 0) {
                await Promise.all(
                  documents.map(async (document) => {
                    if (document.uri) {
                      const fileInfo = await FileSystem.getInfoAsync(document.uri);
                      if (fileInfo.exists) await FileSystem.deleteAsync(document.uri); // 문서삭제
                    }
                  })
                );
              }

              // 모든 삭제 작업이 성공적으로 커밋된 후 화면 이동
              // 부모함수실행 : 탐색기 새로고침
              if (props.loadExplorer) {
                props.loadExplorer();
              }

              // 닫기
              handleDetailCLose();
              //router.back(); 
          
            } catch (error) {
              // 트랜잭션 도중 에러가 발생하면 일괄 취소(Rollback) 후 이쪽으로 들어옴.
              console.error("저장 트랜잭션 오류:", error);
              Alert.alert("에러", "저장 중 오류가 발생하여 모든 작업이 취소되었습니다.");
            }           
          },
          style: "destructive" // iOS에서 빨간색으로 위험 강조
        }
      ]
    );
  };

  // Remember Update
  const onSubmit = async (data: InputFormValues) => { 
    // Secret Update
    if (isValid) {
      await pmmasterUpdateSql(props.pmid, null, data.contents, undefined);

      // 부모함수실행 : 탐색기 새로고침
      if (props.loadExplorer) {
        props.loadExplorer();
      }          
      // 닫기
      handleDetailCLose();
    }    
  };
  
  // 실패 시 Error Message 함수
  const onInvalid = (errors: FieldErrors) => {
    // 특정 필드 에러 alert
    if (errors.contents) {
      Alert.alert("알림", errors.contents.message  as string);
    } else {
      // 필드 상관없이 첫 번째 에러 메시지 띄우기
      const errorMessages = Object.values(errors);
      if (errorMessages.length > 0) Alert.alert("알림", errorMessages[0]?.message  as string);
      }
  };

  // Update 활성화 
  const handleUpdateData = () => {
    setIsEditable(true);
  };

  return (
      <View style={styles.containerze}>
        <View style={styles.button}>
          {documents.length > 0 && (
            <Button label="문서보기" 
                    onPress={handleDocumentPicker} 
                    //icon={"file"} 
                    isFormValid={false} 
                    widthSize={0.20} 
                    heightSize={0.055}
                    fontSize={14}/>
          )}
          {images.length > 0 && (
            <Button label="사진보기" 
                    onPress={handleImagePicker} 
                    //icon={"image"} 
                    isFormValid={false} 
                    widthSize={0.20} 
                    heightSize={0.055}
                    fontSize={14}/>
          )}
          <Button label="수정" 
                  onPress={handleUpdateData} 
                  //icon={"door-closed"} 
                  isFormValid={false} 
                  widthSize={0.14} 
                  heightSize={0.055}
                  fontSize={14}/>
          <Button label="삭제" 
                  onPress={handleDeleteData} 
                  //icon={"door-closed"} 
                  isFormValid={false} 
                  widthSize={0.14} 
                  heightSize={0.055}
                  fontSize={14}/>          
          <Button label="닫기" 
                  onPress={handleDetailCLose} 
                  //icon={"door-closed"} 
                  isFormValid={false} 
                  widthSize={0.14} 
                  heightSize={0.055}
                  fontSize={14}/>          
        </View>
        {/* 입력 */}        
        <View style={ styles.content }>
          <KeyboardAwareScrollView nestedScrollEnabled={true}>
            <Controller
              control={control}
              name="contents"
              //defaultValue={contents} // 부모에게 받은 초기값 셋팅
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.contentsInput, 
                    ! isEditable && { backgroundColor: colors.lightGraysx, 
                                      color: colors.black }, // 비활성화 시 시각적 효과
                    { maxHeight: isEditable ? 250 : 530 }
                  ]}           
                  value={value}
                  onChangeText={(text) => isEditable && onChange(text)}
                  onBlur={onBlur}
                  multiline={true}
                  textAlignVertical='top'
                  scrollEnabled={true}
                  autoCapitalize="none"
                  placeholderTextColor="gray"   
                  editable={true} // 활성화/비활성화 제어 핵심 속성
                  showSoftInputOnFocus={isEditable} // false면 터치해도 키보드가 안 올라옴
                  caretHidden={ ! isEditable}       // 커서(깜빡임)도 안 보이게 설정
                />
              )}
            />
            {errors.contents && <Text style={styles.errorText}>{errors.contents.message}</Text>}          
          </KeyboardAwareScrollView>
        </View> 
        {/* 저장 */}        
        <View>
          <KeyboardToolbar
            offset={{
              opened: 100, // 키보드가 열렸을 때 위치
              closed: 0   // 키보드가 닫혔을 때 위치
            }}
          >
            <KeyboardToolbar.Content>
              <View style={styles.buttonst}>
                <Button 
                  label="저장" 
                  onPress={handleSubmit(onSubmit, onInvalid)} 
                  isFormValid={!isValid} 
                  widthSize={0.50} 
                  heightSize={0.055}
                  fontSize={14}
                />
              </View>
            </KeyboardToolbar.Content>
          </KeyboardToolbar>
        </View>
        {/* 사진보기 */}
        <View>
          <Modal visible={pictureIsOpen} 
                 onRequestClose={() => {setPictureIsOpen(false);}} // 모달 닫기 요청 처리 : 뒤로가기등
                 animationType='none'
                 transparent={false}
          >  
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor}} 
                          edges={['top', 'bottom']}>      
              <ImagePickerView setPictureIsOpen={setPictureIsOpen} 
                               images={images} 
                               pmid={props.pmid}/>
            </SafeAreaView>
          </Modal>
        </View>
        {/* 문서보기 */}
        <View>
          <Modal visible={documentIsOpen} 
                 onRequestClose={() => {setDocumentIsOpen(false);}} // 모달 닫기 요청 처리 : 뒤로가기등
                 animationType='none'
                 transparent={false}
          >        
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor}} 
                          edges={['top', 'bottom']}>
              <DocumentPickerView setDocumentIsOpen={setDocumentIsOpen} 
                                  documents={documents} 
                                  pmid={props.pmid}/>
            </SafeAreaView>
          </Modal>
        </View>   
      </View>
  );
}

export default RememberDetailView;