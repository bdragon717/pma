import ScheduleDetailView from '@/src/screens/ScheduleDetailView';
import { useLocalSearchParams } from 'expo-router';

export default function ScheduleDetailViewModal() {
  // 호출 시 보낸 params를 가져옵니다.
  const { pmid } = useLocalSearchParams<{ pmid: string }>();

  return (
    <ScheduleDetailView pmid={pmid} />
  );
}