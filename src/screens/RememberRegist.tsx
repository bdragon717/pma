/**
 * Remember Data Regist
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { RememberRegistProp } from '@/src/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator'; // 추가
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import {
  Alert,
  Text,
  TextInput,
  View
} from 'react-native';
import 'react-native-get-random-values';
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const inputSchema = z.object({
  title: z.string()
          .min(1, { message: "title를 입력하세요." }) // 최소 1글자 이상
          .refine((val) => val.trim() !== "", "title를 입력하세요."), // 공백 체크
  contents: z.string()
             .min(1, { message: "contents를 입력하세요." }) // 최소 1글자 이상
             .refine((val) => val.trim() !== "", "contents를 입력하세요."), // 공백 체크
});

// 스키마를 통해 TypeScript 타입 자동 추출
type InputFormValues = z.infer<typeof inputSchema>;

const RememberRegist = (props: RememberRegistProp) => {
    // useForm에 스키마 주입 및 타입 설정
    const { control, handleSubmit, formState: { isValid, errors },} = useForm<InputFormValues>({
      resolver: zodResolver(inputSchema),
      mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
      defaultValues: {
        title: '',
        contents: '',
      },
    });
    const { dbRef, pmmasterInsertSql, pictureInsertSql, documentInsertSql } = useDatabase() as any; // Insert SQL
    const { styles } = useTheme();
    const [selectedAssets, setSelectedAssets] = useState<ImagePicker.ImagePickerAsset[]>([]); // 사진 Data
    const [selectedDocs, setSelectedDocs] = useState<DocumentPicker.DocumentPickerAsset[]>([]); // 문서 Data
    const inputRef = useRef<TextInput>(null); // 포커스 지정
    const router = useRouter(); // 경로
    
    // 사진 올리기
    const handleImagePicker = async () => {
      try {
        // 갤러리에서 사진 선택 : asset.uri(임시 캐시 URI (원본 아님))
        let result = await ImagePicker.launchImageLibraryAsync({ // 모바일 기기(핸드폰)의 사진 갤러리 또는 미디어 라이브러리를 열어서 사용자가 사진이나 비디오를 선택할 수 있도록 하는 기능
          mediaTypes: 'images', //ImagePicker.MediaTypeOptions.Images, ImagePicker.MediaType.Images, 
          allowsMultipleSelection: true, // 여러 장 선택을 허용하려면 true로 설정
          quality: 1, 
        });
  
        if (!result.canceled && result.assets) {
          // 여러 개의 비동기 작업(Promise)을 동시에(병렬로) 실행하고, 그 결과가 모두 나올 때까지 기다림
          const savedAssets = await Promise.all(
            result.assets.map(async (asset) => {
              //ImageManipulator로 이미지 조작(가공)
              // 조작 컨텍스트 생성
              const manipContext = ImageManipulator.ImageManipulator.manipulate(asset.uri);
              // 작업 추가 (리사이즈)
              manipContext.resize({ width: 1000 });        
              // 렌더링 실행 (메모리상에 이미지 생성)
              const imageRef = await manipContext.renderAsync();  
              // 핵심: 여기서 saveAsync()를 호출해야 물리적인 uri가 나옵니다.
              // 압축 옵션도 여기서 설정하는 것이 SDK 54의 정석입니다.
              // 리사이즈됨 / JPEG으로 변환됨 / 압축됨 (70%) 실제 파일 생성됨
              // finalUri : 임시 캐시 폴더에 저장
              const { uri: finalUri } = await imageRef.saveAsync({
                compress: 0.7, // 70% 압축
                format: ImageManipulator.SaveFormat.JPEG, // JPEG 포맷으로 저장 (용량 줄이기 위해)
              });
  
              // 앱 내부 저장소(파일명 생성)
              //const fileName = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}_${asset.uri.split('/').pop()}`; // 마지막 항목 삭제 후 반환
              const fileName = `img_${uuidv4()}.jpg`;
              const newPath = `${FileSystem.documentDirectory}${fileName}`; // 앱 전용 영구 저장소, 앱 내부 저장소 (외부에서 안 보임)
        
              // 앱 전용 저장소로 복사(영구 저장)
              // 캐시 → documentDirectory / 영구 저장 / 앱 재시작해도 안 날아감 / OS가 함부로 정리 안 함
              await FileSystem.copyAsync({
                from: finalUri, // 임시 경로
                to: newPath     // 영구 저장 경로
              });
  
              // ImageManipulator 캐시 삭제
              await FileSystem.deleteAsync(finalUri, { idempotent: true });
  
              // 최종 결과
              return { ...asset, uri: newPath };
            })
          );
          // 상태 저장 (기존 리스트와 합침)
          //setSelectedAssets(savedAssets);
          setSelectedAssets((prev) => [...prev, ...savedAssets]);
        } else {
          Alert.alert("알림", '이미지를 선택하지 않았습니다.');
        }
        inputRef.current?.focus(); // 입력창에 포커스 지정
      } catch (e) {
        console.error(e);
        Alert.alert("에러", "사진 선택 중 오류 발생");
      }      
    };

    // 문서 올리기
    const handleDocumentPicker = async () => {
      try {
        // 시스템 파일 선택기(File Explorer) 에서 문서 선택, 시스템 파일 선택창을 띄움
        const result = await DocumentPicker.getDocumentAsync({
          type: '*/*', // 모든 문서 허용 (pdf, docx, xlsx 등)
          multiple: true, // 여러 개 선택 가능 여부
          copyToCacheDirectory: true, // 내부 처리를 위해 캐시 복사 허용
        });
    
        if ( ! result.canceled && result.assets) {
          // 문서 크기 제한 (10MB)
          const MAX_SIZE = 10 * 1024 * 1024; // 10MB
          const oversized = result.assets.some(
            (doc) => doc.size && doc.size > MAX_SIZE
          );          
          if (oversized) {
            Alert.alert("알림", "10MB 이상 파일은 업로드할 수 없습니다.");
          }
          // // 여러 개의 비동기 작업(Promise)을 동시에(병렬로) 실행하고, 그 결과가 모두 나올 때까지 기다림
          const savedDocs = await Promise.all(
            result.assets
              .filter((doc) => ! doc.size || doc.size <= MAX_SIZE) // 파일 용량이 없거나 10MB 이하인 경우만 처리
              .map(async (doc) => {
                // 앱 내부 저장소(파일명 생성)
                // 파일명 정제
                //const fileName = `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}_${doc.name}`;
                const originalName = doc.name ?? 'file';

                const extMatch = originalName.match(/\.[^\.]+$/); // 확장자 추출
                const ext = extMatch ? extMatch[0] : ''; // ".xlsx"

                const baseName = originalName.replace(/\.[^\.]+$/, ''); // 순수 파일 이름 만 추출 - 확장자 제거
                const safeName = baseName.replace(/[^a-zA-Z0-9가-힣._() -]/g, '_').slice(0, 40); // 안전한 파일 이름 생성 (특수문자 제거, 길이 제한 : 40)               
                const fileName = `doc_${uuidv4()}_${safeName}${ext}`; // 최종 파일명 예시: doc_uuid_안전한파일명.xlsx
                const newPath = `${FileSystem.documentDirectory}${fileName}`; // 앱 전용 영구 저장소
  
                // 앱 전용 저장소로 복사(영구 저장)
                await FileSystem.copyAsync({
                  from: doc.uri, // 임시 경로
                  to: newPath,   // 영구 저장 경로
                });

                // 임시 파일 삭제
                await FileSystem.deleteAsync(doc.uri, { idempotent: true });
  
                // 최종 결과
                return { ...doc, uri: newPath };
            })
          );
          // 상태 저장 (기존 리스트와 합침)
          //setSelectedDocs(savedDocs);
          setSelectedDocs((prev) => [...prev, ...savedDocs]);
        } else {
          Alert.alert("알림", "문서를 선택하지 않았습니다.");
        }    
        inputRef.current?.focus();
      } catch (e) {
        console.error(e);
        Alert.alert("에러", "문서 선택 중 오류 발생");
      }
    };

    // DB 등록
    const onSubmit = async (data: InputFormValues) => {
      if ( ! dbRef.current) {
        Alert.alert("에러", "데이터베이스 연결이 없습니다.");
        return;
      }
    
      try {
        // 1. 트랜잭션 시작
        await dbRef.current.withTransactionAsync(async () => {
          // 년월일 셋팅
          const today = new Date();
          const year = today.getFullYear().toString();
          const month = (today.getMonth() + 1).toString().padStart(2, '0');
          const day = today.getDate().toString().padStart(2, '0');
    
          // ID 생성
          const newId = uuidv4();
    
          if (isValid) {
            // 내부 함수들이 에러를 던지면(throw) 자동으로 롤백됨.
            // PMMASTER INSERT
            await pmmasterInsertSql(newId, 'R', year, month, day, data.title, data.contents, props.folderId);
            
            // PICTURE INSERT
            if (selectedAssets.length > 0) {          
              await pictureInsertSql(newId, selectedAssets); 
            }
    
            // DOCUMENT INSERT
            if (selectedDocs.length > 0) {
              await documentInsertSql(newId, selectedDocs);
            }
          } else {
            // 유효하지 않은 데이터일 경우 트랜잭션 중단
            throw new Error("유효성 검사 실패");
          }
        });
    
        // 2. 모든 DB 작업이 성공적으로 커밋된 후 화면 이동
        router.back(); 
    
      } catch (error) {
        // 트랜잭션 도중 에러가 발생하면 일괄 취소(Rollback) 후 이쪽으로 들어옴.
        console.error("저장 트랜잭션 오류:", error);
        Alert.alert("에러", "저장 중 오류가 발생하여 모든 작업이 취소되었습니다.");
      }
    };

    // 실패 시 Error Message 함수
    const onInvalid = (errors: FieldErrors) => {
      // 특정 필드 에러 alert
      if (errors.title) {
        Alert.alert("알림", errors.title.message  as string);
      } else if (errors.contents) {
        Alert.alert("알림", errors.contents.message  as string);
      } else {
        // 필드 상관없이 첫 번째 에러 메시지 띄우기
        const errorMessages = Object.values(errors);
        if (errorMessages.length > 0) Alert.alert("알림", errorMessages[0]?.message  as string);
       }
    };

    return (  
      <View style={styles.containerze}>    
        {/* 입력 폼 */}
        {/* KeyboardAwareScrollView : 사용자가 입력하려는 TextInput이 키보드에 가려지지 않도록 자동으로 스크롤해주는 기능 */}
        <View style={ styles.content }>          
        <KeyboardAwareScrollView nestedScrollEnabled={true} >{/* 안드로이드 시스템이 중첩 스크롤을 허용하도록 명시 */}
          <View style={styles.buttonsd}> 
            <Button label="사진첨부" 
                    onPress={handleImagePicker} 
                    //icon={"image"} 
                    isFormValid={false} 
                    widthSize={0.24} 
                    heightSize={0.055}
                    fontSize={14}/>
            <Button label="문서첨부" 
                    onPress={handleDocumentPicker} 
                    //icon={"image"} 
                    isFormValid={false} 
                    widthSize={0.24} 
                    heightSize={0.055}
                    fontSize={14}/>
          </View>
          <Controller
             control={control}
             name="title"
             render={({ field: { onChange, onBlur, value, ref } }) => (
              <TextInput
                style={styles.titleInput}           
                value={value}
                onChangeText={onChange}
                textAlignVertical='top' // android에서 입력 시작 위치가 위쪽에 오도록
                scrollEnabled={true} // 입력창 안에서 스크롤 가능
                onBlur={onBlur}
                placeholder="제목"
                autoCapitalize="none"
                placeholderTextColor="gray" 
                //ref={inputRef} // 입력창에 ref 연결 
                ref={(e) => {
                  ref(e); // react-hook-form의 ref 연결
                  inputRef.current = e; // 외부에서 쓸 inputRef 연결
                }}
              />
             )}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>} 
          <Controller
             control={control}
             name="contents"
             render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.contentsInput, { maxHeight: 190 }]}           
                value={value}
                onChangeText={onChange}
                multiline={true} // 키보드에 줄바꿈 나타남
                textAlignVertical='top' // android에서 입력 시작 위치가 위쪽에 오도록
                scrollEnabled={true} // 입력창 안에서 스크롤 가능
                onBlur={onBlur}
                placeholder="내용"
                autoCapitalize="none"
                placeholderTextColor="gray"
                //ref={inputRef} // 입력창에 ref 연결 
              />
             )}
           />
           {errors.contents && <Text style={styles.errorText}>{errors.contents.message}</Text>}
          {selectedAssets.length > 0 && (
            <View style={styles.header}>
              <Text style={styles.headerText}>
                사진 [{selectedAssets.length}] 장이 첨부 되었습니다.
              </Text>        
            </View>            
          )}
          {selectedDocs.length > 0 && (
            <View style={styles.header}>
              <Text style={styles.headerText}>
                문서 [{selectedDocs.length}] 개가 첨부 되었습니다.
              </Text>
            </View>
          )}
        </KeyboardAwareScrollView>
        </View>        
        {/* 버튼 */}
        {/* KeyboardToolbar : 키보드가 나타날 때, **키보드 위에 항상 고정되어 표시되는 추가적인 UI(버튼등)**를 만들 수 있게 해줌 */} 
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
      </View>
    );
}

export default RememberRegist;