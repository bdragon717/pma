/**
 * Screen Layout
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import { ScreenLayoutProps } from '@/src/utils/types';
import React from 'react';
import { View } from 'react-native';

const ScreenLayout = (props: ScreenLayoutProps) => {
  const { styles } = useTheme();
  
  return (
    <View style={styles.safe} >
    
      {/* Header 영역 */} 
      {props.header && (
        <View style={styles.headersd}>
          {props.header}
        </View>
      )}

      {/* PathBar */}
      {/* {props.showPathBar && <PathBar currentFolderId={currentFolderId}
                               folders={folders}
                               onNavigate={onNavigate}/>} */}
    
      {/* Main Content */}
      <View style={styles.contentst}>
        {props.children}
      </View>
    
      {/* Footer 영역 */}
      {props.footer && (
        <View style={styles.footer}>
          {props.footer}
        </View>
      )}
    
    </View>
  );
};

export default ScreenLayout;