/**
 * Secret Data List View
 */

import AuthCheck from '@/src/components/AuthCheck';
import Button from '@/src/components/Button';
import PathBar from '@/src/components/PathBar';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useBackHandler } from '@/src/hooks/useBackHandler';
import ScreenFooter from '@/src/layouts/ScreenFooter';
import ScreenHeader from '@/src/layouts/ScreenHeader';
import ScreenLayout from '@/src/layouts/ScreenLayout';
import SecretDetailView from '@/src/screens/SecretDetailView';
import SecretRegist from '@/src/screens/SecretRegist';
import { useAuthStore } from '@/src/store/useAuthStore'; // Zustand 전역 상태
import { ModalOption } from '@/src/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Control, Controller, useForm, useWatch } from 'react-hook-form';
import {
  Alert,
  AppState,
  AppStateStatus,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const conditionSchema = z.object({        
  title: z.string().catch(''), 
  promptValue: z.string().catch(''),           
});

// 스키마를 통해 TypeScript 타입 자동 추출
type ConditionFormValues = z.infer<typeof conditionSchema>;

// 하위 컴포넌트: 버튼
interface SubmitButtonProps {
  control: Control<ConditionFormValues>; 
  onPress: () => void; 
}

// 함수 인자에 타입을 적용
function SubmitButton({ control, onPress }: SubmitButtonProps) {
  const promptValue = useWatch({
    control,
    name: "promptValue",
  });

  const isReady = (promptValue && promptValue.trim() !== "") ? true : false;

  return (
    <Button label="확인" 
            onPress={onPress}
            //icon={"check"} 
            isFormValid={!isReady} 
            widthSize={0.20} 
            heightSize={0.055}
            fontSize={14}/>
  );
}

const SecretListView = () => {
   // useForm에 스키마 주입 및 타입 설정
   const { control, handleSubmit, getValues, reset, resetField, formState: { errors } } = useForm<ConditionFormValues>({
     resolver: zodResolver(conditionSchema),
     mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
     defaultValues: {
       title: '',
       promptValue: '',
     },
   });
   //const [title, setTitle] = useState<string>(''); // title 입력 변수
   const { secretListSelectSql, 
           authEmptyCheckSql,              
           folderSelectSql,
           folderInsertSql,
           folderUpdateSql,
           pmmasterUpdateSql,
           pmmasterDeleteSql,
           deleteFolderRecursiveNormalSql
         } = useDatabase() as any; // SQL
   const { width, height } = useWindowDimensions();
   const { styles, colors } = useTheme();
   const [authCheckIsOpen, setAuthCheckIsOpen] = useState(false); // 인증확인 Modal Popup
   const [auth, setAuth] = useState(false); // Auth
   const [authReady, setAuthReady] = useState(false); // 초기화 완료 여부
   const [currentFolderId, setCurrentFolderId] = useState<number | null>(null); // 현재 폴더
   const [parentFolderId, setParentFolderId] = useState<number | null>(null); // 상위 폴더
   const [folders, setFolders] = useState<any[]>([]); // 현재 폴더의 하위 폴더 목록
   const [files, setFiles] = useState<any[]>([]); // 현재 폴더의 파일 목록
   const [promptVisible, setPromptVisible] = useState(false);
   const [promptTitle, setPromptTitle] = useState<string>('');
   const [promptConfirm, setPromptConfirm] = useState<((value: string) => Promise<void>) | null>(null);
   const [allFolders, setAllFolders] = useState<any[]>([]); // 전체 폴더
   const router = useRouter(); // 경로 
   const [registIsOpen, setRegistIsOpen] = useState(false); // 등록 Modal Popup
   const [detailViewIsOpen, setDetailViewIsOpen] = useState(false); // 상세조회 Modal Popup
   const [pmid, setPmid] = useState<string>(''); 
   const [contents, setContents] = useState<string>(''); 
   const [showCondition, setShowCondition] = useState(false);
   const colorScheme = useColorScheme();

   const [modalVisible, setModalVisible] = useState(false);
   const [modalTitle, setModalTitle] = useState('');
   const [modalOptions, setModalOptions] = useState<ModalOption[]>([]);

   const backgroundColor = colorScheme === 'dark' ? colors.black : colors.white; 

   // 종료여부 
   useBackHandler();

   // 앱 최초 실행 시 잠금
   // 컴포넌트 마운트 시점에만 실행
   useEffect(() => {
     setAuth(false);
     setAuthReady(true);
   }, []);

   // 화면 재진입 시 잠금
   // 특정 화면이 포커스되거나(활성화) 포커스를 잃을(비활성화) 때 특정 로직을 실행하게 해주는 훅(Hook)
   // 화면 전환 시 데이터 초기화나 재로딩, 특정 상태 업데이트 등 화면이 활성화될 때마다 실행되어야 하는 작업에 유용하며, 
   // useEffect의 한계를 보완하여 화면 라이프사이클에 맞춰 동작하게 해줌
   // 화면 포커스 이벤트 처리
   // 데이터 초기화 및 새로고침
   // useEffect 대체
   useFocusEffect(
     // 컴포넌트가 리렌더링될 때 함수를 새로 생성하지 않고 메모리에 저장(Memoization)하여 재사용하게 해줌
     useCallback(() => {
       // 화면이 포커스될 때 실행할 로직
       setAuth(false); 
       //console.log('Screen is focused!');
       // ( 선택 사항) 클린업 함수: 화면이 언포커스될 때 실행됨
       return () => { 
         //console.log('Screen is unfocused!'); 
       };
     }, []) // 의존성 배열이 비어있으면 마운트/언마운트 시에만 실행
   );

   // 백그라운드 → 포그라운드 복귀 시 잠금
   useEffect(() => {
     const sub = AppState.addEventListener( // React Native 앱의 상태(포그라운드, 백그라운드 등) 변화를 감지하기 위해 사용되는 API
       'change', // 이벤트, 상태가 변할 때마다 콜백 함수를 호출
       // active: 앱이 포그라운드에서 실행 중이며 사용자와 상호작용 가능한 상태
       // background: 사용자가 홈 화면으로 나가거나 다른 앱으로 전환하여 앱이 백그라운드에 있는 상태
       // inactive (iOS 전용): 멀티태스킹 뷰로 진입하거나 전화가 오는 등 일시적인 유휴 상태일 때 발생
       (state: AppStateStatus) => {
         if (state === 'active') { // 포그라운드
           setAuth(false);
         }
       }
     );
     return () => sub.remove(); // 컴포넌트 언마운트 시 리스너 해제 (메모리 누수 방지)
   }, []);

   // Zustand 전역 상태에서 읽기
   const isAuth = useAuthStore((state) => state.isAuth); // Zustand 전역 상태
   useEffect(() => {
     if (isAuth === true) {
       setAuth(true);    
       useAuthStore.getState().setAuth(false); // Zustand 다음 사용을 위해 전역 값은 다시 false로 초기화
     }
   }, [isAuth]);

   ///////////////////////////////////////////////////////////////////   

   // 탐색기 새로고침
   const loadExplorer = async () => {
     // 현재 입력된 값을 실시간으로 가져옴
     const { title } = getValues();
     // 폴더 조회
     if (title.trim() === "") {
       const folderRows = await folderSelectSql('P', undefined, currentFolderId);
       //setFolders(folderRows);
       setFolders(Array.isArray(folderRows) ? folderRows : []);
     }     
     // 파일 조회 
     const fileRows = await secretListSelectSql('P', title, currentFolderId);  
     //setFiles(fileRows);
     setFiles(Array.isArray(fileRows) ? fileRows : []);
   };

   // 전체 폴더 
   const loadAllFolders = async () => {
     const rows = await folderSelectSql('P', undefined, undefined);
     //setAllFolders(rows);
     setAllFolders(Array.isArray(rows) ? rows : []);
   };

   // 탐색기 새로고침 : 데이터 재계산 - 내 소속 폴더, 파일
   useEffect(() => {
     if (auth) {
       reset();
       loadExplorer();
       loadAllFolders(); // 전체 폴더
     }
   }, [currentFolderId]);

   // 현재 폴더의 parentId 세팅
   useEffect(() => {
     if (currentFolderId === null) {
       setParentFolderId(null);
       return;
     }
     (async () => {
       const rows = await folderSelectSql('P', currentFolderId, undefined); // ← id 조회
       const folder = rows?.[0];
       setParentFolderId(folder?.parentId ?? null);
     })();
   }, [currentFolderId]);

   // 우선순위
   const typePriority: Record<string, number> = {
     up: 0,
     folder: 1,
     file: 2,
   };
   
   // 탐색기 목록 Data, [..(상위폴더)] → 폴더 → 파일 순서로 정렬된 탐색기 목록
   const explorerItems = [
     ...(currentFolderId !== null ? [{ id: 'up', type: 'up', name: '⬅️ ..' }] : []), // 상위폴더, 현재 위치가 루트(null)가 아닌경우
     ...folders.map(f => ({ ...f, type: 'folder' })), // 폴더
     ...files.map(f => ({ ...f, type: 'file' })), // 파일
   ].sort((a, b) => {
     if (a.type !== b.type) return typePriority[a.type] - typePriority[b.type]; // up, folder, file 순으로 정렬
     return (a.name || a.title).localeCompare(b.name || b.title); // 타입이 같다면(예: 폴더와 폴더끼리), 이름을 가나다/ABC 순으로 정렬
   });

   // 폴더 List
   const renderItem = ({ item }: { item: any }) => {
     // 상위 폴더
     if (item.type === 'up') {
       return (
         <Pressable onPress={() => setCurrentFolderId(parentFolderId ?? null)}>
           <Text style={styles.row}>⬅️ ..</Text>
         </Pressable>
       );
     }
   
     // 폴더 & 파일
     return (
       <Pressable
         onPress={() => { // 짧게누름
           if (item.type === 'folder') {
             setCurrentFolderId(item.id); {/* 데이터 재계산 - 내 소속 폴더 파일, 상태 변경으로 loadExplorer(); 실행 */}
           } else {
             handleOpenDetail(item.pmid, item.contents ?? '')
           }
         }}
         onLongPress={() => // 길게누름
          showCustomModal('폴더 메뉴', [
            { text: '이름변경', onPress: () => { setModalVisible(false); handleRename(item); } },
            { text: '이동', onPress: () => { setModalVisible(false); handleMove(item); } }, // 여기서 handleMove 호출
            { text: '삭제', onPress: () => { setModalVisible(false); handleDelete(item) } },
            { text: '취소', isCancel: true }
          ])
         }
         style={({ pressed }) => [styles.row, pressed && {backgroundColor: colors.gray}]}
       >
         <Text numberOfLines={1} // 한 줄로 표시
               ellipsizeMode="tail" // 말줄임표(...) 끝에 표시
         >
           {item.type === 'folder' ? '📁' : '📄'} {item.name || item.title}
         </Text>
       </Pressable>
     );
   };
    
   // 폴더 & 파일 이름 변경
   const handleRename = (item: any) => {
     setPromptTitle('이름 변경'); // 모달 제목 설정
     setPromptConfirm(() => async (value: string) => { // 확인 버튼 클릭 시 실행될 함수
       if (!value.trim()) return;
       if (item.type === 'folder') {
         await folderUpdateSql(item.id, value?.trim()); // 폴더명
       } else {
         await pmmasterUpdateSql(item.pmid, value?.trim()); // 파일명
       }
       reset();
       await loadExplorer(); // 탐색기 새로고침
    });
     setPromptVisible(true); // 모달 열기
   };
 
   // 폴더 & 파일 이동
   const handleMove = async (item: any) => {
     const targetFolders = await folderSelectSql('P', undefined, undefined); // 전체 폴더 조회  
     // 기존 폴더 목록 변환
     const folderOptions = targetFolders.map((f: any) => ({
       text: f.name, // 선택 버튼에 폴더명 표시
       onPress: async () => { 
         setModalVisible(false);
         if (item.type === 'folder' && f.id === item.id) return; // 자기 자신을 자기 자신의 하위 폴더로 이동시키려는 경우를 방지         
         if (item.type === 'folder') {
           await folderUpdateSql(item.id, null, f.id); // 폴더 이동 : f.name의 하위 폴더로 이동
         } else {
           await pmmasterUpdateSql(item.pmid, null, null, f.id); // 파일 이동 : f.name의 하위 파일로 이동
         }
         reset();
         loadExplorer(); // 탐색기 새로고침
       },
     }));

     // 맨 앞에 '최상위(전체)' 옵션 추가
     const allOptions = [
       {
         text: '전체', // 선택 버튼에 전체 폴더명 표시
         onPress: async () => {
           setModalVisible(false);
           if (item.type === 'folder') {
             await folderUpdateSql(item.id, null, null); // 폴더 이동 : 전체 폴더로 이동
           } else {
             await pmmasterUpdateSql(item.pmid, null, null, null); // 파일 이동 : 전체 폴더로 이동
           }
           reset();
           loadExplorer(); // 탐색기 새로고침
         },
       },
       ...folderOptions, // 기존 폴더 목록
       { text: '취소', isCancel: true }
     ];
   
     showCustomModal('이동할 폴더 선택', allOptions);
   };
 
   // 폴더 삭제
   const handleDelete = (item: any) => {
     Alert.alert(
       '삭제 확인',
       `"${item.name || item.title}" 정말로 이 항목을 삭제 하시겠습니까?`,
       [
         {
           text: "취소",
           style: "cancel" // iOS에서 굵은 글씨로 취소 강조
         },
         {
           text: '삭제',
           style: 'destructive',
           onPress: async () => {
             if (item.type === 'folder') { 
               await deleteFolderRecursiveNormalSql(item.id); // 폴더 & 파일
             } else {
               await pmmasterDeleteSql(item.pmid); // 특정 파일
             }
             reset();
             loadExplorer(); // 탐색기 새로고침
           },
         },
       ]
     );
   };

   // 새폴더 생성
   const handleCreateFolder = () => {
     setPromptTitle('새 폴더'); // 모달 제목 설정
     setPromptConfirm(() => async (value: string) => { // 확인 버튼 클릭 시 실행될 함수
       if (typeof value !== 'string') return;
       const v = value?.trim();
       if (!v) return;
       reset();
       await folderInsertSql('P', v, currentFolderId, null, null); // 폴더 추가 : 현재 폴더(currentFolderId) 하위에 새 폴더 생성
       await loadExplorer(); // 탐색기 새로고침
     });
     setPromptVisible(true); // 모달 열기
   }; 

   // 탐색기 새로고침(조회)
   const handleLoadExplorer = () => {
     setFolders([]);
     handleSubmit(() => loadExplorer(), // 검증 성공 시 위 loadExplorer 실행
                  (errors) => console.log("검증 실패 원인:", errors) // 실패 시 원인 출력
     )();
   };   

   ///////////////////////////////////////////////////////////////////

   // 인증 PopUp Open
   const handleAuth = async () => {
     const row = await authEmptyCheckSql(); // Auth is Empty 확인
     if (row.isEmpty === 0) { // 미존재
       router.push({
         pathname: '/authRegist', // (modals) 폴더 안의 파일명
         params: { 
           registFlag: "Regist" // 상세 데이터 전달
         }
       });
     } else {
       setAuthCheckIsOpen(true); // 인증확인
     }
   };   

   // 상세 조회 호출 함수
    const handleOpenDetail = (pmid: string, contents: string) => {
      setDetailViewIsOpen(true);
      setPmid(pmid);
      setContents(contents);
      // router.push({
      //   pathname: '/secretDetailView', // (modals) 폴더 안의 파일명
      //   params: { pmid, contents }     // 상세 데이터 전달
      // });
    };

   // 등록 화면 호출 함수
   const handleOpenRegist = () => {
    setRegistIsOpen(true)
    //  router.push({
    //     pathname: '/secretRegist', // (modals) 폴더 안의 파일명
    //     params: { 
    //       folderId: currentFolderId !== null ? String(currentFolderId) : '' // 상세 데이터 전달
    //     }
    //  });
   };  
   
   // 실 비지니스 처리 
  const onSubmit = async (data: ConditionFormValues) => {
    if ( ! promptConfirm) return;
    await promptConfirm(data.promptValue);
    setPromptConfirm(null);
    setPromptVisible(false);      
  };

  // 모달 호출용 공통 함수
  const showCustomModal = (title: string, options: ModalOption[]) => {
    setModalTitle(title);
    setModalOptions(options);
    setModalVisible(true);
  };

   return (
      <View style={styles.containerze}>
        {/* authReady 되기 전에는 아무것도 렌더 안 함 */}
        {authReady && (
        <>
        {/* 인증 */}
        { ! auth && (
          <View>
            <View style={styles.authheader}>
              <Text style={styles.authtext}>인증이 필요합니다.</Text>
              <Button label="인증" 
                      onPress={handleAuth} 
                      //icon={"pencil"} 
                      isFormValid={false} 
                      widthSize={0.50} 
                      heightSize={0.055}
                      fontSize={14}/>
            </View>            
            <View>
              {/* 인증 확인*/}
              <Modal visible={authCheckIsOpen} 
                     onRequestClose={() => {setAuthCheckIsOpen(false);}} // 모달 닫기 요청 처리 : 뒤로가기등
                     animationType='none'
                     transparent={true}
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, {width: '80%', height: '27%'}]}> 
                    <AuthCheck setAuthCheckIsOpen={setAuthCheckIsOpen} 
                               setAuth={setAuth} />
                  </View>
                </View>
              </Modal>
            </View>
          </View>
        )}
        {/* 인증 성공 후 컨텐츠 */}
        {auth && (
          <View style={styles.content}>
            {/* 검색 */}
            <View style={styles.serchst}>
              <Button label={showCondition ? "닫기" : "열기"} 
                      onPress={() => setShowCondition(prev => !prev)} 
                      //icon={"magnify"} 
                      isFormValid={false} 
                      widthSize={0.20} 
                      heightSize={0.05}
                      fontSize={12}/>
              <Button label="조회" 
                      onPress={handleLoadExplorer} 
                      //icon={"magnify"} 
                      isFormValid={false} 
                      widthSize={0.20} 
                      heightSize={0.05}
                      fontSize={12}/>
              <Button label="쓰기" 
                      onPress={handleOpenRegist} 
                      //icon={"pencil"} 
                      isFormValid={false} 
                      widthSize={0.20} 
                      heightSize={0.05}
                      fontSize={12}/>
              <Button label="새폴더" 
                      onPress={handleCreateFolder} 
                      //icon={"pencil"} 
                      isFormValid={false} 
                      widthSize={0.20} 
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
                    style={[styles.input, {width: width*0.67, height: height*0.05}]}           
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="제목"
                    placeholderTextColor="gray"                     
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
            </View>
            )}            
            {/* 경로 조회 */}
            <View>
              <PathBar currentFolderId={currentFolderId}
                       folders={allFolders}
                       onNavigate={setCurrentFolderId}
              /> 
            </View>            
            {/* 목록 조회 */}
            <View style={styles.content}>
             <FlatList
                ItemSeparatorComponent={() => <View style={styles.separator}/>} // 리스트 내의 각 항목 사이에 구분선을 렌더링하는 데 사용되는 속성
                data={explorerItems || []} // 화면에 표시할 리스트 아이템을 담고 있는 배열을 지정하는 필수 속성
                renderItem={renderItem} // 데이터 배열의 각 요소를 어떻게 렌더링할지 정의하는 콜백 함수
                keyExtractor={(item, index) => `${item.type}-${item.id ?? item.pmid ?? index}`} // 각 항목에 대한 고유한 키(React Key)를 생성하도록 지시하는 속성
                contentContainerStyle={{ paddingBottom: 50 }} // FlatList 자체에 하단 여백을 줌
             />
           </View>
          </View>
        )} 
        {/* 상세 조회 */}
        <View>          
          <Modal visible={detailViewIsOpen} 
                 onRequestClose={() => {setDetailViewIsOpen(false);}} // 모달 닫기 요청 처리 : 뒤로가기등
                 animationType='none'
                 transparent={false}
          >
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor}} 
                          edges={['top', 'bottom']}>
              <ScreenLayout 
                header={<ScreenHeader applyInset={true} title={"금고상세조회"}/>} 
                footer={<ScreenFooter applyInset={true} />}
              >      
                 <SecretDetailView pmid={pmid ?? ''}
                                   contents={contents ?? ''}
                                   loadExplorer={loadExplorer}
                                   setDetailViewIsOpen={setDetailViewIsOpen}
                 />
              </ScreenLayout>
            </SafeAreaView>          
          </Modal>
        </View>
        {/* 금고 등록 */}
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
                header={<ScreenHeader applyInset={true} title={"금고등록"} />} 
                footer={<ScreenFooter applyInset={true} />}
              >      
                 <SecretRegist folderId={currentFolderId ? currentFolderId : null}
                               setRegistIsOpen={setRegistIsOpen}
                 />
              </ScreenLayout>
            </SafeAreaView>           
          </Modal>
        </View>
        {/* 새 폴더 생성 */}
        <View>          
          <Modal visible={promptVisible}
                 transparent={true}
                 animationType="fade"
                 onRequestClose={() => setPromptVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, {width: '80%', height: '22%'}]}>
                <Text style={styles.title}>{promptTitle}</Text>
                <Controller
                  control={control}
                  name="promptValue"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, {width: width*0.68, height: height*0.05}]}         
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={promptTitle}
                      placeholderTextColor="gray"
                      autoCapitalize="none" // 첫 글자가 대문자로 자동 변환되는 것을 방지
                    />
                  )}
                />
                {errors.promptValue && <Text style={styles.errorText}>{errors.promptValue.message}</Text>}                
                <View style={styles.serchsn}>
                  <Button label="취소" 
                      onPress={() => {setPromptVisible(false); resetField("promptValue");}} 
                      //icon={"cancel"} 
                      isFormValid={false} 
                      widthSize={0.20} 
                      heightSize={0.055}
                      fontSize={14}/>
                  <SubmitButton control={control} onPress={handleSubmit(onSubmit)} />
                </View>
              </View>
            </View>
          </Modal>
        </View>
        {/* 폴더 관리 */}
        <View>
         <Modal visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
         >
           <Pressable style={styles.modalOverlay} 
                      onPress={() => setModalVisible(false)}
           >
             <View style={styles.modalContainer}>
               <Text style={styles.modalTitle}>{modalTitle}</Text>
               <ScrollView style={styles.scrollView}>
                 {modalOptions.map((opt, index) => (
                   <Pressable key={index} // 누르고 있을 때(pressed) 배경색을 살짝 어둡게 처리
                              style={({ pressed }) => [
                                styles.modalButton,
                                pressed && { backgroundColor: colors.whiteSmoke }, 
                                opt.isCancel && styles.cancelButton
                              ]}
                              onPress={() => {
                                if (opt.isCancel) setModalVisible(false);
                                else opt.onPress?.();
                              }}                               
                              android_ripple={{ color: colors.lightGraySn }} // 안드로이드에서 물결 효과 추가
                   >
                     <Text style={[styles.modalButtonText, opt.isCancel && { color: colors.red }]}>
                       {opt.text}
                     </Text>
                   </Pressable>
                 ))}
               </ScrollView>
             </View>
            </Pressable>
          </Modal>
        </View>
        </>
        )}
      </View>
  );  
}

export default SecretListView;