import SecretRegist from '@/src/screens/SecretRegist';
import { useLocalSearchParams } from 'expo-router';

export default function SecretRegistModal() {
  // 호출 시 보낸 params를 가져옵니다.
  const { folderId } = useLocalSearchParams<{ folderId: string }>();

  return (
    <SecretRegist folderId={folderId ? Number(folderId) : null} />
  );
}