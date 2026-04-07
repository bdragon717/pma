/**
 * Update Manager Github (version only)
 */

import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, BackHandler, Linking, Platform } from 'react-native';
import * as semver from 'semver';

interface AppVersion {
  latestVersion: string;
  isMandatory: boolean;
  updatedAt: string;
  storeUrl: {
    android: string;
    ios: string;
  };
}

const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/bdragon717/pma/main/app-version.json';

// -----------------------------
// utils
// -----------------------------
// 버전 정규화
const normalizeVersion = (v?: string) => {
  if (!v) return '0.0.0';
  return semver.coerce(v)?.version ?? '0.0.0';
};

// 다운로드 및 설치
const openStore = async (url: string) => {
  if (Platform.OS !== 'android') {
    await Linking.openURL(url);
    return;
  }

  try {
    // 저장 경로 설정 (임시 캐시 폴더)
    const fileUri = FileSystem.cacheDirectory + 'PMA_update.apk';

    // 기존 파일 삭제
    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    // [사용자 안내] 즉시 다운로드 시작 알림
    Alert.alert('업데이트 시작', '최신 파일을 다운로드 중입니다. 설치 창이 열릴때까지 기다려 주십시오.');

    // 다운로드
    // 앱 내부 비동기 다운로드 (사용자 개입 없음)
    const downloadResumable = (FileSystem as any).createDownloadResumable(
      url,
      fileUri,
      {},
      (progress: any) => {
        const total = progress.totalBytesExpectedToWrite || 1;
        const percent = progress.totalBytesWritten / total;
        console.log(`다운로드 진행률: ${(percent * 100).toFixed(0)}%`);
      }
    );

    const result = await downloadResumable.downloadAsync();
    if ( ! result || result.status !== 200) {
      throw new Error('다운로드 결과가 존재하지 않습니다.');
    }

    // 설치
    // 다운로드 완료 즉시 -> 안드로이드 설치 화면 자동 호출
    // 이 코드가 실행되면 화면에 "업데이트 하시겠습니까?" 팝업이 나옴.
    const contentUri = await FileSystem.getContentUriAsync(result.uri);

    await IntentLauncher.startActivityAsync(
      'android.intent.action.INSTALL_PACKAGE', {
        data: contentUri,
        flags: 1, // Intent.FLAG_GRANT_READ_URI_PERMISSION
        type: 'application/vnd.android.package-archive',
      });

  } catch (e) {
    console.error('자동 업데이트 실패:', e);
    // 실패 시에만 브라우저 열기 제안
    Alert.alert('오류', '자동 설치를 시작할 수 없습니다. 직접 다운로드하시겠습니까?', [
      { text: '취소' },
      { text: '확인', onPress: () => Linking.openURL(url) }
    ]);
  }
};

// -----------------------------
// 최신 버전 가져오기
// -----------------------------
// GITHUB : app-version.json
const getLatestVersion = async () => {
  try {
    const response = await fetch(`${GITHUB_RAW_URL}?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error('버전 정보 fetch 실패');
    }

    const data: AppVersion = await response.json();

    return {
      latestVersion: data.latestVersion,
      isMandatory: data.isMandatory,
      storeUrl:
        Platform.OS === 'android'
          ? data.storeUrl.android
          : data.storeUrl.ios,
    };
  } catch (error) {
    console.log('버전 조회 실패:', error);
    return null;
  }
};

// -----------------------------
// 업데이트 체크
// -----------------------------
export async function CheckForUpdate(force = false) {
  try {
    const updateData = await getLatestVersion();
    if ( ! updateData) return;

    // GITHUB 버전
    const { latestVersion, isMandatory, storeUrl } = updateData;
    // 앱버전(기기내)
    const currentVersion = Application.nativeApplicationVersion ?? '0.0.0';

    let needUpdate = force;

    // 버전 체크 : GITHUB 버전 > 앱버전(기기내) - true
    try {
      needUpdate =
        force ||
        semver.gt(
          normalizeVersion(latestVersion),
          normalizeVersion(currentVersion)
        );
    } catch (e) {
      console.log('버전 비교 실패:', e);
    }

    if ( ! needUpdate) return;
    
    // -----------------------------
    // 업데이트
    // -----------------------------
    if (isMandatory) {
      // 강제 업데이트
      Alert.alert(
        '필수 업데이트',
        '안정적인 서비스 이용을 위해 업데이트가 필요합니다.',
        [
          {
            text: '업데이트',
            onPress: async () => {
              await openStore(storeUrl);
              setTimeout(() => BackHandler.exitApp(), 1000); // 1초후 앱종료
            },
          },
        ],
        { cancelable: false } // 뒤로가기 방지
      );
    }  else {
      // 선택 업데이트
      Alert.alert(
        '업데이트 안내',
        `새 버전(${latestVersion})이 있습니다.\n업데이트 하시겠습니까?`,
        [
          {
            text: '나중에',
            style: 'cancel',
          },
          {
            text: '업데이트',
            onPress: () => openStore(storeUrl),
          },
        ]
      );
   }
  } catch (error) {
    console.log('업데이트 체크 실패:', error);
  }
}