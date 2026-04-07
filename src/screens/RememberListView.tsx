/**
 * Remember Data List View
 */

import Button from '@/src/components/Button';
import PathBar from '@/src/components/PathBar';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useBackHandler } from '@/src/hooks/useBackHandler';
import ScreenFooter from '@/src/layouts/ScreenFooter';
import ScreenHeader from '@/src/layouts/ScreenHeader';
import ScreenLayout from '@/src/layouts/ScreenLayout';
import RememberDetailView from '@/src/screens/RememberDetailView';
import { ModalOption } from '@/src/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, } from 'react';
import { Control, Controller, useForm, useWatch } from 'react-hook-form';
import {
  Alert,
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
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod'; // 유효성 검사

// Zod 스키마 정의 (데이터의 설계도), 유효성 검사
const conditionSchema = z.object({
  year: z.string()
         .regex(/^[0-9]*$/, "숫자만 입력 가능합니다") // 빈 값 포함 숫자만 허용
         .or(z.literal('')), // 빈 문자열("")인 경우 위 조건들을 무시하고 통과시켜줌       
  month: z.string()
          .regex(/^[0-9]*$/, "숫자만 입력 가능합니다")
          .refine((val) => {    
             if (val === '') return true; // 빈 문자열은 통과  
             const num = parseInt(val, 10);
             return num >= 1 && num <= 12; // 숫자로 변환 후 범위 체크
           }, { message: "1월에서 12월 사이만 가능합니다" }),         
  day: z.string()
        .regex(/^[0-9]*$/, "숫자만 입력 가능합니다")
        .refine((val) => {
           if (val === '') return true;
           const num = parseInt(val, 10);
           return num >= 1 && num <= 31;
         }, { message: "1일에서 31일 사이만 가능합니다" }),        
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

// Dropdown Data
const monthDropdownData = [
  { label: '월', value: '' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '10', value: '10' },
  { label: '11', value: '11' },
  { label: '12', value: '12' },
];

const RememberListView = () => {
   // useForm에 스키마 주입 및 타입 설정
   const { control, handleSubmit, setValue, getValues, reset, resetField, formState: { isValid, errors },} = useForm<ConditionFormValues>({
     resolver: zodResolver(conditionSchema),
     mode: "onChange", // 실시간으로 입력 변화를 감지해서 isValid를 갱신
     defaultValues: {
       year: '',
       month: '',
       day: '',
       title: '',
       promptValue: '',
     },
   });
   const { rememberListSelectSql,
           folderSelectSql,
           folderUpdateSql,
           pmmasterUpdateSql,
           deleteFolderRecursiveMultiSql,
           deletePhysicalFilesSql,
           pmmasterDeleteSql,
           folderInsertSql,
           pictureSingleDeleteSql,
           documentSingleDeleteSql,
           dbRef
         } = useDatabase() as any; // SQL
   const { width, height } = useWindowDimensions();
   const { styles, colors } = useTheme();
   const [currentFolderId, setCurrentFolderId] = useState<number | null>(null); // 현재 폴더
   const [parentFolderId, setParentFolderId] = useState<number | null>(null); // 상위 폴더
   const [folders, setFolders] = useState<any[]>([]); // 현재 폴더의 하위 폴더 목록
   const [files, setFiles] = useState<any[]>([]); // 현재 폴더의 파일 목록
   const [promptVisible, setPromptVisible] = useState(false);
   const [promptTitle, setPromptTitle] = useState<string>('');
   const [promptConfirm, setPromptConfirm] = useState<((value: string) => Promise<void>) | null>(null);
   const [allFolders, setAllFolders] = useState<any[]>([]); // 전체 폴더
   const router = useRouter(); // 경로 
   const [dayDropdownData, setDayDropdownData] = useState([{ label: '', value: '' }]); // day 콤보 데이터
   const [showCondition, setShowCondition] = useState(false);
   const [detailViewIsOpen, setDetailViewIsOpen] = useState(false); // 상세조회 Modal Popup
   const [pmid, setPmid] = useState<string>(''); 
   const [contents, setContents] = useState<string>(''); 
   const colorScheme = useColorScheme(); 

   const [modalVisible, setModalVisible] = useState(false);
   const [modalTitle, setModalTitle] = useState('');
   const [modalOptions, setModalOptions] = useState<ModalOption[]>([]);  

   const backgroundColor = colorScheme === 'dark' ? colors.black : colors.white; 
    
   // 종료여부 
   useBackHandler();       

  // 항목이 입력되었는지 체크
  //  const watchedPromptValue = watch("promptValue"); // 실시간으로 promptValue를 감시
  //  const isFormValid = watchedPromptValue.trim() !== '' ? true : false;

  // year 값을 실시간 감시
  const selectedYear = useWatch({
    control,
    name: 'year',
  });

  // month 값을 실시간 감시
  const selectedMonth = useWatch({
    control,
    name: 'month',
  });

  // 년도나 월이 바뀔 때마다 '일' 데이터 갱신
  useEffect(() => {
    // 현재 선택된 일자 값 가져오기
    const { day } = getValues();

    // 기준 연도 설정 (입력값 없으면 당년)
    const yearNum = selectedYear && !isNaN(parseInt(selectedYear)) 
                  ? parseInt(selectedYear) 
                  : new Date().getFullYear();

    // 기준 월 설정 (선택값 없으면 당월)
    const monthNum = selectedMonth && !isNaN(parseInt(selectedMonth))
                   ? parseInt(selectedMonth)
                   : new Date().getMonth() + 1;

    // 해당 연도/월의 마지막 날짜 계산
    const lastDay = new Date(yearNum, monthNum, 0).getDate();

    // 일(Day) 드롭다운 데이터 생성
    const newDays = Array.from({ length: lastDay }, (_, i) => ({
      label: (i + 1).toString(),
      value: (i + 1).toString(), 
    }));

    // 기본값 null(빈값)을 포함하여 셋팅
    setDayDropdownData([{ label: '일', value: '' }, ...newDays]);

    // 현재 선택된 일자가 계산된 마지막 날보다 크면 초기화
    const dayNum = parseInt(day, 10);
    if (!isNaN(dayNum) && dayNum > lastDay) {
      setValue('day', '');
    }
  }, [selectedYear, selectedMonth, setValue]); 

   ///////////////////////////////////////////////////////////////////   

   // 탐색기 새로고침
   const loadExplorer = async () => {
     // 현재 입력된 값을 실시간으로 가져옴
     const { year, month, day, title } = getValues();

     // 폴더 조회
     if (year.trim() === "" && 
         month.trim() === "" && 
         day.trim() === "" && 
         title.trim() === "") {
       const folderRows = await folderSelectSql('R', undefined, currentFolderId);
       //setFolders(folderRows);
       setFolders(Array.isArray(folderRows) ? folderRows : []);
      }     

     // 파일 조회 
     const fileRows = await rememberListSelectSql('R', year, month, day, title, currentFolderId);
     //setFiles(fileRows);
     setFiles(Array.isArray(fileRows) ? fileRows : []);
   };

   // 전체 폴더 
   const loadAllFolders = async () => {
     const rows = await folderSelectSql('R', undefined, undefined);
     //setAllFolders(rows);
     setAllFolders(Array.isArray(rows) ? rows : []);
   };

   // 탐색기 새로고침
   useEffect(() => {
     reset();
     loadExplorer();
     loadAllFolders(); // 전체 폴더
   }, [currentFolderId]);

   // 현재 폴더의 parentId 세팅
   useEffect(() => {
     if (currentFolderId === null) {
       setParentFolderId(null);
       return;
     }
     (async () => {
       const rows = await folderSelectSql('R', currentFolderId, undefined); // ← id 조회
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
           {item.type === 'folder' ? `📁 ${item.name || item.title}` 
                                   : `📄 [${item.year}/${item.month}/${item.day}] ${item.name || item.title}`}
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
     const targetFolders = await folderSelectSql('R', undefined, undefined); // 전체 폴더 조회   
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
             try {
               if (item.type === 'folder') { 
                 await deleteFolderRecursiveMultiSql(item.id); // 폴더 & 파일
               } else {
                 // 물리적 파일 삭제 (사진 및 문서)
                 await deletePhysicalFilesSql(item.pmid);
                 // DB 데이터삭제
                 await dbRef.current?.withTransactionAsync(async () => {                   
                   await pictureSingleDeleteSql(item.pmid);
                   await documentSingleDeleteSql(item.pmid);
                   await pmmasterDeleteSql(item.pmid);
                 });
               }
               // 성공 시에만 새로고침
               reset();
               loadExplorer();
             } catch (error) {
               console.error("삭제 중 오류 발생:", error);
               Alert.alert("에러", "삭제 중 문제가 발생했습니다.");
             }
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
       await folderInsertSql('R', v, currentFolderId, null, null); // 폴더 추가 : 현재 폴더(currentFolderId) 하위에 새 폴더 생성
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

   // 상세 조회 호출 함수
   const handleOpenDetail = (pmid: string, contents: string) => {
    setDetailViewIsOpen(true);
    setPmid(pmid);
    setContents(contents);
    //  router.push({
    //    pathname: '/rememberDetailView', // (modals) 폴더 안의 파일명
    //    params: { pmid, contents }       // 상세 데이터 전달
    //  });
   };

   // 등록 화면 호출 함수
   const handleOpenRegist = () => {
     router.push({
        pathname: '/rememberRegist', // (modals) 폴더 안의 파일명
        params: { 
          folderId: currentFolderId !== null ? String(currentFolderId) : '' // 상세 데이터 전달
        }
     });
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
             name="year"
             //rules={{ required: "이름을 입력해주세요!" }}
             render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, {width: width*0.20, height: height*0.05}]}           
                value={value}
                onChangeText={(text) => {
                  onChange(text.replace(/[^0-9]/g, '')); // 숫자가 아닌 문자 제거 후 직접 입력값 반영
                }}
                onBlur={onBlur}
                placeholder="년"
                autoCapitalize="none"
                placeholderTextColor="gray"    
                keyboardType="number-pad"
                maxLength={4}
                //autoFocus={true}
              />
             )}
           />
           {errors.year && <Text style={styles.errorText}>{errors.year.message}</Text>}
           <Controller
             control={control}
             name="month"
             render={({ field: { onChange, value } }) => (
               <Dropdown
                 style={styles.dropdownsn} // 테두리 등 스타일 지정
                 placeholderStyle={styles.placeholder}
                 selectedTextStyle={styles.selectedText} // 여기가 선택된 글자 스타일
                 placeholder="월"
                 maxHeight={300} // 리스트의 최대 높이
                 dropdownPosition="auto" // 'auto', 'top', 'bottom' 중 선택
                 data={monthDropdownData}
                 labelField="label"
                 valueField="value"
                 value={value}
                 onChange={val => {
                   onChange(val.value); // month 값 업데이트
                   setValue('day', '');  // useForm 내의 day 값을 빈 값으로 초기화
                 }}
                //  search // 검색(입력)창 활성화
                //  searchPlaceholder="직"
               />
             )}
           />
           {errors.month && <Text style={styles.errorText}>{errors.month.message}</Text>}
           <Controller
             control={control}
             name="day"
             render={({ field: { onChange, value } }) => (
               <Dropdown
                 style={styles.dropdownsn} // 테두리 등 스타일 지정
                 placeholderStyle={styles.placeholder}
                 selectedTextStyle={styles.selectedText} // 여기가 선택된 글자 스타일
                 placeholder="일"
                 maxHeight={300} // 리스트의 최대 높이
                 dropdownPosition="auto" // 'auto', 'top', 'bottom' 중 선택
                 data={dayDropdownData}
                 labelField="label"
                 valueField="value"
                 value={value}
                 onChange={val => {
                   onChange(val.value); // day 값 업데이트
                 }}
               />
             )}
           />
           {errors.day && <Text style={styles.errorText}>{errors.day.message}</Text>}
           <Controller
             control={control}
             name="title"
             render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, {width: width*0.30, height: height*0.05}]}           
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="제목"
                autoCapitalize="none"
                placeholderTextColor="gray" 
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
                 header={<ScreenHeader applyInset={true} title={"기록상세조회"}/>} 
                 footer={<ScreenFooter applyInset={true} />}
               >      
                 <RememberDetailView pmid={pmid ?? ''}
                                     contents={contents ?? ''}
                                     loadExplorer={loadExplorer}
                                     setDetailViewIsOpen={setDetailViewIsOpen}
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
                    // rules={{required: true, // 필수여부
                    //         validate: (value) => value.trim() !== "" || "공백만 입력할 수 없습니다" // 검사
                    // }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.input, {width: width*0.68, height: height*0.05}]}          
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={promptTitle}
                        autoCapitalize="none"
                        placeholderTextColor="gray" 
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
      </View>
  );
}

export default RememberListView;