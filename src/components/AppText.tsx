import React from 'react';
import { Text, TextInput, TextInputProps, TextProps } from 'react-native';

export function AppText(props: TextProps) {
  return (
    <Text 
      {...props} 
      allowFontScaling={false} // 폰트 크기 고정
      maxFontSizeMultiplier={1.2} // 너무 커지는 것 방지 (선택 사항)
    />
  );
}

export function AppTextInput(props: TextInputProps) {
  return (
    <TextInput 
      {...props} 
      allowFontScaling={false} 
      maxFontSizeMultiplier={1.2} 
    />
  );
}