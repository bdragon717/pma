/**
 * Reusable Top Tabs
 */

import { ReusableTopTabsProps } from '@/src/utils/types';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';

const TopTabs = withLayoutContext(
  createMaterialTopTabNavigator().Navigator
);

const ReusableTopTabs = (props: ReusableTopTabsProps) => {
  return (
    <TopTabs
      screenOptions={{
        //tabBarPosition: 'top', // 탭 바 상단 이동
        tabBarScrollEnabled: true, // 탭 제목이 길면 가로로 스크롤 허용
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
        tabBarIndicatorStyle: {
          backgroundColor: 'blue',
          height: 3,
        },
        tabBarStyle: {
          //backgroundColor: 'white',
          marginTop: 10,
          height: 48,
          elevation: 0, // Android 그림자 제거
          shadowOpacity: 0, // iOS 그림자 제거
        },
        tabBarItemStyle: {
          width: 'auto', // 탭 너비를 글자 길이에 맞춤
          height: 48, // 기본 48, 더 줄일 수 있음
          paddingHorizontal: 18,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          lineHeight: 18, // 기본 lineHeight가 커서 아래쪽 여백 생길 수 있음
          fontWeight: 'bold',
        },         
        swipeEnabled: true,
      }}
    >
      {props.tabs.map(tab => (
        <TopTabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        />
      ))}
    </TopTabs>
  );
};

export default ReusableTopTabs;