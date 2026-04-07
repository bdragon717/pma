/**
 * 스크롤 책임을 분리하기 위한 전용 레이어
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import { ScrollContentProps } from '@/src/utils/types';
import React from 'react';
import { ScrollView } from 'react-native';

const ScrollContent = (props: ScrollContentProps) => {
  const { styles } = useTheme();
  
  return (
    <ScrollView
      contentContainerStyle={[
        styles.containersh,
        { paddingHorizontal: props.padding },
        { flexGrow: 1 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {props.children}
    </ScrollView>
  );
};

export default ScrollContent;