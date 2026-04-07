import * as Application from 'expo-application';
import { getApp } from 'firebase/app';
import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
} from 'firebase/remote-config';
import { Alert, Linking, Platform } from 'react-native';
import semver from 'semver';
import InAppUpdates, { IAUUpdateKind } from 'sp-react-native-in-app-updates';

const inAppUpdates = new InAppUpdates(false);

// 중복 Alert 방지
let isAlertShowing = false;

// -----------------------------
// 업데이트 체크
// -----------------------------
export async function CheckForUpdate(force = false) {
  try {
    let latestVersion = '';
    let isMandatory = false;
    let storeUrl = '';

    // -----------------------------
    // Remote Config 공통 설정
    // ----------------------------
    const remoteConfigInstance = getRemoteConfig(getApp());

    // 기본값 설정
    remoteConfigInstance.defaultConfig = {
      android_latest_version: '0.0.0',
      android_is_mandatory: false,
      android_store_url: '',
      ios_is_mandatory: false,
    };

    // 캐싱 설정
    remoteConfigInstance.settings = {
      minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000, // 캐시 유지 시간 (1시간)
      fetchTimeoutMillis: __DEV__ ? 0 : 60000,           // 서버 응답 대기 시간 (1분)
    };

    // 최신 설정을 가져와 활성화
    await fetchAndActivate(remoteConfigInstance);

    // -----------------------------
    // 최신 버전 가져오기 - 플랫폼별 처리
    // ----------------------------
    if (Platform.OS === 'android') {
      latestVersion = getValue(remoteConfigInstance, 'android_latest_version').asString();
      isMandatory = getValue(remoteConfigInstance, 'android_is_mandatory').asBoolean();
      storeUrl = getValue(remoteConfigInstance, 'android_store_url').asString() || `market://details?id=${Application.applicationId}`;

    } else if (Platform.OS === 'ios') {
      try {
        const response = await fetch(
          `https://itunes.apple.com/lookup?bundleId=${Application.applicationId}`
        );
        const data = await response.json();

        if (data.results?.length > 0) {
          latestVersion = data.results[0].version;
          storeUrl = `itms-apps://itunes.apple.com/app/id${data.results[0].trackId}`;
        }
      } catch (e) {
        console.log('iOS 버전 조회 실패', e);
      }
      // 강제 여부는 Remote Config에서
      isMandatory = getValue(remoteConfigInstance, 'ios_is_mandatory').asBoolean();
    }

    // 값 없으면 종료
    if ( ! latestVersion || ! storeUrl) return;

    // 앱 버전 (기기내)
    const currentVersion = Application.nativeApplicationVersion ?? '0.0.0';

    const isValid = semver.valid(latestVersion) && semver.valid(currentVersion);
    const needUpdate = force || (isValid && semver.gt(latestVersion, currentVersion)) ||
                                ( ! isValid && latestVersion !== currentVersion);
    if ( ! needUpdate) return;
    
    // -----------------------------
    // 업데이트
    // -----------------------------
    if (isMandatory) {
      // 강제 업데이트   
      if (Platform.OS === 'android') {
        try {
          const result = await inAppUpdates.checkNeedsUpdate();
          const androidResult = result as any;

          if (androidResult.shouldUpdate) { // 스토어에 새 버전이 있는지 여부
            if (androidResult.isImmediateUpdateAllowed) { // 즉시 업데이트(Immediate Update) 기능을 사용할 수 있는 상태 여부
              // 구글 플레이 전용 업데이트 창 open
              // 구글 플레이 스토어에서 제공하는 '인앱 업데이트(In-App Updates) API'를 사용하여, 앱을 종료하지 않고 그 자리에서 즉시 업데이트를 진행하는 핵심 로직
              // 사용자가 스토어에 직접 들어가서 '업데이트' 버튼을 누르는 번거로움이 없음
              // 앱 내에서 팝업이 뜨며 스토어로 이동하지 않고 즉시 다운로드를 시작하는 강제 '인앱 업데이트' 방식
              await inAppUpdates.startUpdate({
                updateType: IAUUpdateKind.IMMEDIATE, // IMMEDIATE (강제), FLEXIBLE (선택)
              });
              return; // 함수종료
            }
          }
        } catch (e) {
          console.log('InAppUpdate 실패 → fallback');
        }
      }
      showMandatoryAlert(storeUrl);

    } else {                
      // 선택 업데이트
      showOptionalAlert(latestVersion, storeUrl);
    }    
  } catch (error) {
    console.error('업데이트 체크 오류:', error);
  }
}

// -----------------------------
// 강제 업데이트
//스토어로 이동하여 사용자가 직접 '업데이트' 버튼을 눌러 업데이트
// -----------------------------
const showMandatoryAlert = (url: string) => {
  if (isAlertShowing) return;
  isAlertShowing = true;

  Alert.alert(
    '필수 업데이트',
    '앱을 이용하려면 최신 버전으로 업데이트가 필요합니다.',
    [
      {
        text: '업데이트',
        onPress: () => {
          if (url) {
            Linking.openURL(url).catch(() => {
              console.log('스토어 이동 실패');
            });
          }
          isAlertShowing = false;
        },
      },
    ],
    { cancelable: false } // 뒤로가기 등으로 닫기 방지
  );
};

// -----------------------------
// 선택 업데이트
// 스토어로 이동하여 사용자가 직접 '업데이트' 버튼을 눌러 업데이트
// -----------------------------
const showOptionalAlert = (version: string, url: string) => {
  if (isAlertShowing) return;
  isAlertShowing = true;

  Alert.alert(
    '업데이트 안내',
    `새로운 버전(${version})이 있습니다.`,
    [
      {
        text: '나중에',
        style: 'cancel',
        onPress: () => {
          isAlertShowing = false;
        },
      },
      {
        text: '업데이트',
        onPress: () => {
          if (url) {
            Linking.openURL(url).catch(() => {
              console.log('스토어 이동 실패');
            });
          }
          isAlertShowing = false;
        },
      },
    ]
  );
};