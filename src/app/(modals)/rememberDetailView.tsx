import RememberDetailView from '@/src/screens/RememberDetailView';
import { useLocalSearchParams } from 'expo-router';

export default function RememberDetailViewModal() {
  // 호출 시 보낸 params를 가져옵니다.
  const { pmid, contents } = useLocalSearchParams<{ pmid: string, contents: string }>();

  return (
    <RememberDetailView pmid={pmid ?? ''} contents={contents ?? ''} />
  );
}