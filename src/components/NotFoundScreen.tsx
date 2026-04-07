/**
 * NotFound Screen
 */

import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View>
      <Text>페이지를 찾을 수 없습니다.</Text>
      <Link href="/">홈으로 돌아가기</Link>
    </View>
  );
}