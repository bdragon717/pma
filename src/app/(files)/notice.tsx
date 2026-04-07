/**
 * Notice
 */

import BookmarkScreen from '@/src/components/BookmarkScreen';
import { useTheme } from '@/src/contexts/ThemeContext';
import React from 'react';
import {
    Text,
    View
} from 'react-native';

const Notice = () => {
    const { styles } = useTheme(); 

    return (
        <BookmarkScreen>
          <View style={styles.container}>
            <View style={styles.content}>
              <View style={styles.menualHeader}>
                <Text style={styles.menualHText}>공지사항</Text>
              </View>
              <View>
                <Text style={styles.menualSText}>개요</Text> 
                <Text style={styles.menualtext}>
                  앱에서 사용자에게 공지할 사항을 관리한다.
                </Text>
                <Text style={styles.menualSText}>1.배포</Text>
                <Text style={styles.menualtext}>1.1. 최초배포</Text>
                <Text style={styles.menualtext}>
                  카톡으로 전달된 링크를 클리하여 다운로드 후 설치한다.
                </Text>
                <Text style={styles.menualtext}>1.2. 수정배포</Text>
                <Text style={styles.menualtext}>
                  앱을 완전히 종료 후 켜면 업데이트 창이 열리며 다운로드 후 설치한다.
                </Text>
              </View>                
            </View>
          </View>
        </BookmarkScreen>
    );
}

export default Notice;