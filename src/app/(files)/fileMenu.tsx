import { useTheme } from '@/src/contexts/ThemeContext';
import ScreenFooter from '@/src/layouts/ScreenFooter';
import ScreenLayout from '@/src/layouts/ScreenLayout';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

const MENU = [
    { id: 'menual', title: '사용 설명서', path: 'menual' },
    { id: 'backup', title: '백업/복원', path: 'backup' },
    { id: 'notice', title: '공지사항', path: 'notice' },
//   { id: 'qna', title: '문의사항', path: '/qna' },
//   { id: 'faq', title: '자주 묻는 질문', path: '/faq' },
//   { id: 'terms', title: '약관 및 정책', path: '/terms' },
];

const baseUrl = '/(files)/';

export default function CustomerServiceScreen() {
  const router = useRouter();
  const { styles, colors } = useTheme();

  return (
    <ScreenLayout
      footer={<ScreenFooter applyInset={true}/>}
    >
    <ScrollView style={styles.containerni}>
      {/* 섹션 타이틀 */}
      <View style={styles.titlesn}>
        <Text style={styles.textet}>고객센터</Text>
      </View>

      {/* 메뉴 리스트 */}
      {MENU.map((menu: { id: string; title: string; path: string }) => (       
        <Pressable
          key={menu.id}
          onPress={() =>
            router.push({
              //pathname: `/(files)/${menu.path}` as any,
              pathname: `${baseUrl}${menu.path}` as any,
              params: { title: menu.title }
            })
          }       
          style={({ pressed }) => [styles.containersd,
            { flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 15,
              backgroundColor: pressed ? colors.gray : colors.background,}]}
        >
          <Text style={styles.textfh}>
            {menu.title}
          </Text>
          <Icon name="chevron-right" size={24} color={colors.black} />
        </Pressable>
      ))}
    </ScrollView>
    </ScreenLayout>
  );
}