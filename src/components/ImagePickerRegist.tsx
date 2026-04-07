/**
 * 핸드폰 내 사진 가져오기(다중선택)
 * 라이브러리 설치 : npx expo install expo-image-picker 또는 expo-media-library
 */

import Button from '@/src/components/Button';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ImagePickerRegistProp } from '@/src/utils/types';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef } from 'react';
import { Text, View } from 'react-native';

const ImagePickerRegist = (props: ImagePickerRegistProp) => {  
  const selectedAssets = useRef(0);
  const { styles } = useTheme();

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ // 모바일 기기(핸드폰)의 사진 갤러리 또는 미디어 라이브러리를 열어서 사용자가 사진이나 비디오를 선택할 수 있도록 하는 기능
      mediaTypes: 'images', //ImagePicker.MediaType.Images,     
      allowsMultipleSelection: true, // 여러 장 선택을 허용하려면 true로 설정
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      // 이제 ImagePickerAsset[] 타입의 데이터를 setAssets에 문제없이 넘겨줄 수 있습니다.
      props.setSelectedAssets(result.assets); // 기기 내의 미디어 파일 경로(URI)
      selectedAssets.current = result.assets.length;
    } else {
      alert('이미지를 선택하지 않았습니다.');
    }
  };

  // 사진등록 PopUp Close
  const handleImagePickerView = () => {
      props.setPictureIsOpen(false);
  };

  return (
    <View style={styles.containerst}>
      <View>
          <Text style={styles.textsn}>
            사진을 선택 하세요.
          </Text>
      </View>
      {selectedAssets.current > 0 && (
        <View>
          <Text style={styles.textsn}>
            선택된 사진 개수: {selectedAssets.current}
          </Text>
        </View>
      )}
      <View style={styles.serch}>
        <Button label="사진선택" 
                onPress={pickImageAsync} 
                //icon={"image"} 
                isFormValid={false} 
                widthSize={0.20} 
                heightSize={0.055}
                fontSize={14}/>
        <Button label="닫기" 
                onPress={handleImagePickerView} 
                //icon={"door-closed"} 
                isFormValid={false} 
                widthSize={0.20} 
                heightSize={0.055}
                fontSize={14}/>
      </View>
    </View>
  );
}

export default ImagePickerRegist;