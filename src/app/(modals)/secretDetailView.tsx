import SecretDetailView from '@/src/screens/SecretDetailView';
import { useLocalSearchParams } from 'expo-router';

export default function SecretDetailViewModal() {
  // 호출 시 보낸 params를 가져옵니다.
  const { pmid, contents } = useLocalSearchParams<{ pmid: string, contents: string }>();

  return (
    <SecretDetailView pmid={pmid ?? ''} contents={contents ?? ''} />
  );
}