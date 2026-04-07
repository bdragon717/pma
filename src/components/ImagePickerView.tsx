/**
 * 사진 보기
 */

import Button from '@/src/components/Button';
import { useDatabase } from '@/src/contexts/SQLiteDBContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ImagePickerViewProp, PictureData } from '@/src/utils/types';
import { AntDesign } from '@expo/vector-icons'; // 선택 아이콘을 위해 expo vector icons 사용
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library'; // 스마트폰의 기본 갤러리(사진 앱)에 접근하여 사진이나 동영상을 읽고, 쓰고, 관리하는 기능을 제공하는 라이브러리
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  StatusBar,
  Text,
  View
} from 'react-native';
import ImageView from "react-native-image-viewing";

const ImagePickerView = (props: ImagePickerViewProp) => {
  const { styles, colors } = useTheme();
  const [images, setImages] = useState<PictureData[]>([]); // 사진 Data
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // 사진 선택 Data
  const {pictureSelectSql, pictureDeleteSql} = useDatabase() as any; // Select SQL
  const [visible, setIsVisible] = useState(false); // 갤러리 모달 표시 여부
  const [currentImage, setCurrentImage] = useState<{ uri: string | undefined }[]>([]); // 현재 보여줄 이미지 배열
  const [downloadProgress, setDownloadProgress] = useState(0); // 다운로드 진행률
  const [isDownloading, setIsDownloading] = useState(false); // 다운로드 상태

  // 이미지 URI 목록 Sect
  const handleSetData = async () => {
    setImages(props.images);
  };

  // 사진 Data Set
  useEffect(() => {
    handleSetData();
  }, [props.images]);

  // SQLite에서 이미지 URI 목록 Select
  const handleFetchData = async () => {
    const rows = await pictureSelectSql(props.pmid);
    setImages(rows);
  };

  // 삭제_이미지 선택/해제 토글 함수
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

  // 확대_이미지를 터치했을 때 호출할 함수
  const handleImagePress = (imageUri: string | undefined) => {
    setCurrentImage([{ uri: imageUri }]); // 배열 형태로 전달
    setIsVisible(true);
  };
 
  // FlatList 렌더링 아이템 (각 이미지 카드)
  const renderItem = ({ item }: { item: PictureData }) => {
    const isSelected = selectedIds.includes(item.id); // 배열 내 특정 요소의 존재 여부를 확인 : true / false
    return (
      <Pressable onPress={() => handleImagePress(item.uri)} // 짭게 터치시(확대)
                 onLongPress={() => toggleSelect(item.id)}  // 길게 터치시(삭제)             
                 delayLongPress={1000} // 1초 설정
                 style={({ pressed }) => [ // pressed 상태를 사용하여 동적 스타일 적용
                   styles.imageWrapper,
                   isSelected && styles.selectedBorder, // 선택 시 테두리 표시                   
                   { opacity: pressed ? 0.8 : 1 } // activeOpacity={0.8} 대신 pressed 상태일 때 opacity를 0.8로 설정
                 ]}
      >
      <Image source={{ uri: item.uri }} style={styles.image} />
      {isSelected && (
        <View style={styles.selectionOverlay}>
          <AntDesign name="check-circle" size={24} color={colors.vividBlueBackground} />
        </View>
      )}
    </Pressable>
    );
  };

  // 선택된 URI들을 상위 컴포넌트나 다른 로직에서 사용하기 위한 getter (선택사항)
  const getSelectedUris = () => {
    return images
        .filter(image => selectedIds.includes(image.id))
        .map(image => image.uri);
  };

  // 삭제 버튼 핸들러
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      Alert.alert("알림", "선택된 사진이 없습니다.");
      return;
    }    
    Alert.alert(
      "삭제 확인", 
      `선택된 ${selectedIds.length}개의 사진을 영구적으로 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        { text: "확인", 
          onPress: async () => {
            try {
              // 선택된 사진들의 실물 파일 경로(URI) 가져오기(삭제대상)
              const imagesToDelete = images.filter(img => selectedIds.includes(img.id));

              // FileSystem을 사용하여 물리적 파일 삭제(병렬삭제)
              await Promise.all(
                imagesToDelete.map(async (image) => {
                  if (image.uri) {
                    const fileInfo = await FileSystem.getInfoAsync(image.uri);
                    if (fileInfo.exists) await FileSystem.deleteAsync(image.uri);
                  }
                })
              );

              // SQLite에서 DB 데이터 삭제
              await pictureDeleteSql(selectedIds);

              // 상태 초기화 및 리로드
              setSelectedIds([]); // 선택 초기화
              handleFetchData(); // 목록 새로고침
              
              Alert.alert("알림", "선택한 사진이 삭제되었습니다.");
            } catch (error) {
              console.error("삭제 중 오류:", error);
              Alert.alert("오류", "사진 삭제 중 문제가 발생했습니다.");
            }
          } 
        }
      ]
    );
  };

  // 사진등록 PopUp Close
  const handleClose = () => {
    props.setPictureIsOpen(false);
  };

  // Modal PopUp Close
  const handleModalClose = () => {
    setIsVisible(false);
  };

  // 파일명 추출
  const getFileName = (uri: string) => {
    return uri.split('/').pop() || `img_${Date.now()}.jpg`;
  };
  
  // 권한 요청
  const requestPermission = async () => {
    try {
      // 권한 요청 시도
      const result = await MediaLibrary.requestPermissionsAsync();
      if (result.status === 'granted') return true;
  
      // 권한 거절됨 (알림창 띄우기)
      if ( ! result.canAskAgain) {
        Alert.alert("권한 필요", "설정에서 직접 허용해주세요.", [
          { text: "설정으로 이동", onPress: () => Linking.openSettings() }
        ]);
      } else {
        Alert.alert("알림", "권한이 필요합니다.");
      }

      return false;
  
    } catch (error) {
      console.log("권한 요청 중 에러 발생:", error);
      
      Alert.alert(
        "권한 설정 필요",
        "현재 권한 상태를 확인할 수 없습니다. 설정 화면에서 '사진 및 동영상' 권한을 직접 허용해주세요.",
        [{ text: "설정으로 이동", onPress: () => Linking.openSettings() }]
      );

      return false;
    }
  };
  
  // 앨범 생성 or 가져오기
  const getOrCreateAlbum = async (albumName: string, asset: MediaLibrary.Asset) => {
    const album = await MediaLibrary.getAlbumAsync(albumName);
    if ( ! album) {
      // 앨범이 없으면 새로 생성 (false: 기존 자산 유지), 앨범을 만들면서 동시에 사진(asset)을 한 장 집어넣음
      const newAlbum = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      return { album: newAlbum, created: true };       
    }

    return { album, created: false }; // 앨범이 이미 존재하는 경우 해당 앨범 객체 반환
  };

  // 다운로드 버튼 핸들러
  const handleDownload = async () => {
  if (selectedIds.length === 0) {
    Alert.alert("알림", "선택된 사진이 없습니다.");
    return;
  }

  Alert.alert(
    "다운로드 확인",
    `선택된 ${selectedIds.length}개의 사진을 갤러리에 저장하시겠습니까?`,
    [
      { text: "취소", style: "cancel" },
      {
        text: "확인",
        onPress: async () => {
          try {
            const hasPermission = await requestPermission(); // 권한 요청
            if ( ! hasPermission) return;

            setIsDownloading(true); // 다운로드 상태 시작
            setDownloadProgress(0); // 진행률 초기화

            // 다운로드 대상 사진들
            const imagesToDownload = images.filter(img => selectedIds.includes(img.id)); 

            const albumName = "PMADownloads"; // 저장할 앨범 이름
            let completed = 0; // 완료된 다운로드 수 카운터

            // 기존 파일 조회 (중복 방지)
            const existingAlbum = await MediaLibrary.getAlbumAsync(albumName); // 앨범이 이미 존재하는지 확인
            let existingFileNames: string[] = []; // 기존 앨범이 있으면 그 안의 파일명 목록 가져오기

            if (existingAlbum) {
              const assets = await MediaLibrary.getAssetsAsync({ // 앨범이 존재하면 그 안의 자산(사진) 목록 가져오기
                album: existingAlbum, // 앨범 필터링
                first: 1000, // 최대 1000개까지 가져오기 (필요에 따라 조정 가능)
              });
              existingFileNames = assets.assets.map(a => a.filename); // 기존 앨범에 있는 파일명 목록 추출
            }

            for (const image of imagesToDownload) {
              try {
                if ( ! image.uri) {
                  completed++;
                  setDownloadProgress(completed / imagesToDownload.length);
                  continue; // 다음 사진으로
                }
            
                const fileName = getFileName(image.uri); // URI에서 파일명 추출
            
                // 중복 방지 체크
                if (existingFileNames.includes(fileName)) {
                  completed++;
                  setDownloadProgress(completed / imagesToDownload.length);
                  continue; // 이미 있으면 다음 사진으로
                }
            
                // 물리 파일 존재 여부 확인
                const fileInfo = await FileSystem.getInfoAsync(image.uri);
                if ( ! fileInfo.exists) {
                  completed++;
                  setDownloadProgress(completed / imagesToDownload.length);
                  continue; // 파일 없으면 다음 사진으로
                }
            
                // 갤러리 자산 생성(다운로드)
                const asset = await MediaLibrary.createAssetAsync(image.uri);
            
                // 앨범 가져오기 또는 생성
                const { album, created } = await getOrCreateAlbum(albumName, asset);
            
                // 이미 존재하던 앨범일 때만 추가 (방금 생성된 앨범은 사진이 이미 포함됨)
                if (album?.id && ! created) { // 앨범이 존재하고 새로 생성된 것이 아닐 때만 추가
                  await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                }
            
                completed++;
                setDownloadProgress(completed / imagesToDownload.length);
            
              } catch (err) {
                console.error("개별 다운로드 오류:", err);
                completed++;
                setDownloadProgress(completed / imagesToDownload.length);
              }
            }

            setIsDownloading(false); // 다운로드 상태 종료
            setSelectedIds([]); // 선택 초기화

            Alert.alert("완료", "갤러리에 저장되었습니다.");
          } catch (e) {
            console.error(e);
            setIsDownloading(false);
            Alert.alert(
                "저장 실패 (권한 필요)",
                "기기 설정에서 '사진 및 동영상' 권한이 허용되지 않았습니다. 설정 화면에서 직접 허용해 주세요.",
                [
                  { text: "취소", style: "cancel" },
                  { 
                    text: "설정으로 이동", 
                    onPress: () => Linking.openSettings() // 클릭 시 앱 설정 페이지로 즉시 이동
                  }
                ]
            );
          }
        }
      }
    ]
  );
};

  return (
    <View style={styles.containereh}>
      <View style={styles.headersn}>
        <Text style={styles.headerText}>
          사진 갤러리 ({selectedIds.length}개 선택됨)
        </Text>        
      </View>  
      <View style={styles.buttonsh}>
        {selectedIds.length > 0 && (
          <>
            <Button label="사진다운로드" 
                    onPress={handleDownload} 
                    //icon={"image"} 
                    isFormValid={false} 
                    widthSize={0.30} 
                    heightSize={0.055}
                    fontSize={14}/>
            <Button label="사진삭제" 
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
        <FlatList<PictureData>
          data={images}
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
        <>        
          {/* 갤러리 확대 보기 모달 */} 
          {/* ImageView 외부에서 상태바를 강제로 노출 설정 */}
          <StatusBar 
            barStyle="light-content" 
            hidden={false} // 숨겨진 상태바를 강제로 보이게 함
            backgroundColor="transparent"
            translucent={true}
          />          
          <ImageView
            images={currentImage}
            imageIndex={0}
            visible={visible}
            onRequestClose={() => setIsVisible(false)}
            backgroundColor={colors.black}            
            HeaderComponent={() => ( // 헤더 컴포넌트에서 Pressable을 사용하여 닫기 버튼 구현
              <View style={styles.imageView}>
                <StatusBar barStyle="light-content" hidden={false} />
                <View style={styles.buttonsh}>
                  <Button label="닫기" 
                          onPress={handleModalClose} 
                          //icon={"door-closed"} 
                          isFormValid={false} 
                          widthSize={0.20} 
                          heightSize={0.055}
                          fontSize={14}/>  
                </View>
              </View>
            )}
          />
        </>
      </View>
    </View>
      
  );
};

export default ImagePickerView;