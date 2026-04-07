import ScreenFooter from '@/src/layouts/ScreenFooter';
import ScreenHeader from '@/src/layouts/ScreenHeader';
import ScreenLayout from '@/src/layouts/ScreenLayout';
import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <ScreenLayout 
      header={<ScreenHeader applyInset={true} showBack={true} />} 
      footer={<ScreenFooter applyInset={true}/>}
    >
      <Stack
        screenOptions={{
          presentation: 'modal', // 아래에서 위로 올라오는 모달 효과
          headerShown: false,    // 직접 만든 ScreenHeader를 쓸 것이므로 기본 헤더는 숨김
          animation: 'none',
        }}
      />
    </ScreenLayout>
  );
}