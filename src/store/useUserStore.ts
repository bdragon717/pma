/**
 * Zustand User Regist
 */

import { LoginInputType, UserAuthType } from '@/src/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useUserStore = create<UserAuthType>()(
  // persist : zustand 상태를 영구 저장(persistence)하는 미들웨어, 앱 재시작해도 로그인 상태 유지 가능
  // AsyncStorage : React Native에서 사용하는 로컬 데이터베이스, 앱을 껐다 켜도 데이터가 사라지지 않게 해줌
  persist( 
    (set) => ({
      // 사용자 정보, 로그인 상태, 상태 복구 여부 초기값 설정
      user: null,
      isLoggedIn: false,
      isHydrated: false,

      // 비밀번호 변경 날짜, 비밀번호 만료 여부, 오늘 배너 숨김 여부
      hideExpireBannerToday: null,
      passwordExpired: false, 
      
      // 상태가 AsyncStorage에서 복원되었음을 나타내는 플래그 설정
      setHydrated: (value) =>
        set({
          isHydrated: value,
        }),

      ///////////////////////////////////////////////////////
      // 로그인
      // 로그인 시 사용자 정보와 로그인 상태 업데이트
      login: (user: LoginInputType) => 
        set({
          user: user,
          isLoggedIn: true,
        }),

      // 로그아웃 시 상태 초기화하여 로그인 정보 제거
      logout: () =>
        set({
          user: null,
          isLoggedIn: false,
        }),      

      ///////////////////////////////////////////////////////
      // 비밀번호
      // 비밀번호 만료 여부 설정
      setPasswordExpired: (value) =>
        set({ 
          passwordExpired: value, 
        }),

      // '나중에' 버튼 클릭 시 호출: 3개월 연장 효과
      postponePasswordChange: () => {
        set((state) => {
          if (!state.user) return state;

          // 한국 시간 시차 보정 (UTC+9)
          const today = new Date();    
          const offset = today.getTimezoneOffset() * 60000;
          const localDate = new Date(today.getTime() - offset);
          const ymd = localDate.toISOString().slice(0, 10); // "2026-03-19"

          return {
            user: {
              ...state.user,
              changepwdate: ymd,
            },
            passwordExpired: false,
          };
       });
      },

      // 오늘 하루 배너 숨김 설정, 현재 시간 기준으로 오늘 자정까지 배너 숨김
      // 사용자가 "오늘 더 이상 보지 않기"를 클릭했을 때 실행되는 함수
      hideBannerToday: () => 
      {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        set({
          hideExpireBannerToday: endOfDay.getTime(),
        });
      },      
    }),

    ///////////////////////////////////////////////////////
    // persist 옵션 설정
    {
      // AsyncStorage에 저장될 키 이름
      name: 'auth-storage', 

      // 자동으로 JSON으로 변환하여 AsyncStorage에 저장(저장:객체->JSON,복원:JSON->객체)
      storage: createJSONStorage(() => AsyncStorage), 

      // AsyncStorage에 저장할 목록 지정
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isHydrated: state.isHydrated,
        passwordExpired: state.passwordExpired,
        hideExpireBannerToday: state.hideExpireBannerToday,
      }),
      
      // 앱이 켜질 때 저장된 데이터를 다시 불러오는 과정(Rehydration)을 관리
      // 앱이 시작되면 auth-storage에 저장된 값이 있는지 확인
      // 저장된 값을 가져와서 현재 앱의 상태에 채워 넣음
      // 복구가 끝나면 setHydrated(true)를 실행하여 "이제 데이터 복구가 끝났으니 화면을 그려도 된다"라고 앱에 신호를 보냄
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      }, 
    }
  )
);