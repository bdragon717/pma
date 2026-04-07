/**
 * App Layout
 */

import { useTheme } from '@/src/contexts/ThemeContext';
import { AppLayoutProps } from '@/src/utils/types';
import React from 'react';
import { View } from 'react-native';

const AppLayout = (props: AppLayoutProps) => {
  const { styles } = useTheme();

  return (
    <View style={styles.safe} >

      {/* Header */}  
      {props.header && (
        <View style={styles.headersd}>
          {props.header}
        </View>
      )}

      {/* Body */}
      <View style={styles.content}>
        {props.children}
      </View>

      {/* Footer */}
      {props.footer && (
        <View style={styles.footer}>
          {props.footer}
        </View>
      )}

    </View>
  );
};

export default AppLayout;