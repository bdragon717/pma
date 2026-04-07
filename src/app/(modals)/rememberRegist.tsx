import RememberRegist from '@/src/screens/RememberRegist';
import { useLocalSearchParams } from 'expo-router';

export default function RememberRegistModal() {
  // 호출 시 보낸 params를 가져옵니다.
  const { folderId } = useLocalSearchParams<{ folderId: string }>();

  return (
    <RememberRegist folderId={folderId ? Number(folderId) : null} />
  );
}