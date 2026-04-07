/**
 * Notice Modal
 */

import { useNoticeStore } from '@/src/store/useNoticeStore';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';

export default function NoticeModal() {
  const { visible, hideToday, close, notice } = useNoticeStore();
  const slideAnim = useRef(new Animated.Value(300)).current; // 시작 위치

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0, // 원래 위치
        duration: 250, // 0.25초 동안 올라옴
        useNativeDriver: true, // 애니메이션 처리를 메인 스레드가 아닌 네이티브 엔진에서 처리하여 매우 부드럽게 작동
      }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Animated.View style={{
          width: '85%',
          backgroundColor: '#fff',
          borderRadius: 16,
          padding: 20,
          transform: [{ translateY: slideAnim }],
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            📢 공지사항
          </Text>

          <Text style={{ marginTop: 10 }}>
            {notice?.content}
          </Text>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
          }}>
            <Pressable onPress={hideToday}>
              <Text>오늘 하루 안보기</Text>
            </Pressable>

            <Pressable onPress={close}>
              <Text style={{ fontWeight: 'bold' }}>닫기</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}