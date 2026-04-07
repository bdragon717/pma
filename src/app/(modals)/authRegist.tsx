import AuthRegist from '@/src/components/AuthRegist';
import { useLocalSearchParams } from 'expo-router';

export default function AuthRegistModal() {
  // 호출 시 보낸 params를 가져옵니다.
  const { registFlag } = useLocalSearchParams<{ registFlag: string }>();

  return (
    <AuthRegist registFlag={registFlag ?? ''} />
  );
}