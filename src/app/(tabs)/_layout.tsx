import PasswordExpireBanner from '@/src/components/PasswordExpireBanner';
import AppFooter from '@/src/layouts/AppFooter';
import AppHeader from '@/src/layouts/AppHeader';
import AppLayout from '@/src/layouts/AppLayout';
import ReusableTopTabs from '@/src/layouts/ReusableTopTabs';

export default function TabLayout() {
  return (
    <AppLayout
      header={<AppHeader applyInset={true} showBack={true}/>}
      footer={<AppFooter applyInset={true}/>}
    >
      <PasswordExpireBanner />
      
      <ReusableTopTabs
        tabs={[
          { name: 'index', title: '기록' },
          { name: 'schedule', title: '일정' },
          { name: 'secret', title: '금고' },
          { name: 'telnoview', title: '전화번호' },
          { name: 'alarm', title: '알람설정' },
          { name: 'backuprestore', title: '백업복구' },
        ]}
      />
    </AppLayout>
  );
}
