import { useTheme } from '@/src/contexts/ThemeContext';
import { Folder, PathBarProps } from '@/src/utils/types';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const PathBar = (props: PathBarProps) => {
  const { styles } = useTheme();

  // 경로계산
  const buildPath = () => {
    const path: Folder[] = [];
    let id = props.currentFolderId;
  
    while (id !== null) {
      const folder = props.folders.find(f => f.id === id);
      if (!folder) break;
      path.unshift(folder); // 배열의 가장 첫 번째 자리에 데이터 추가
      id = folder.parentId; // 부모ID
    }
  
    return path;
  };

  const path = buildPath();

  return (
    <ScrollView horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.containersd}
    >
      {/* 루트 */}
      <Pressable onPress={() => props.onNavigate(null)}>
        <Text style={styles.link}>📁 전체</Text>
      </Pressable>

      {path.map((folder, index) => {
        const isLast = index === path.length - 1;

        return (
          <View key={folder.id} style={styles.rowsn}>
            <Text style={styles.separatorst}> › </Text>

            <Pressable disabled={isLast}
                       onPress={() => props.onNavigate(folder.id)}
            >
              <Text style={[styles.link, isLast && styles.current]}>
                {folder.name}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

export default PathBar;