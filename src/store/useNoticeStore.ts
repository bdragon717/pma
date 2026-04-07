/**
 * Zustand Notice Store
 * 자동 저장: set() 함수로 상태를 변경하기만 하면 persist 미들웨어가 알아서 AsyncStorage에 동기화
 * hiddenUntil 상태 추가: 날짜 비교를 위해 수동으로 읽어오던 로직 대신, 아예 스토어 상태에 날짜를 포함
 * check 로직 단순화: async/await 없이 즉시 상태 비교가 가능해져 성능상 이점이 있고 코드 흐름이 명확
 * partialize 설정: visible 같은 상태는 앱을 껐다 켰을 때 초기값(false)이어야 하므로, 
 * 실제로 저장할 필요가 있는 noticeId와 hiddenUntil 날짜만 선택적으로 저장하도록 설정
 */

import { Notice, NoticeState } from '@/src/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useNoticeStore = create<NoticeState>()(
  persist(
    (set, get) => ({
      // 상태
      visible: false,
      noticeId: null,
      notice: null,      
      hiddenUntil: null, // '오늘 하루 보지 않기'를 누른 날짜를 저장할 상태 추가
      hydrated: false, // 초기값은 false

      // 액션
      setHydrated: (state) => set({ hydrated: state }),

      ///////////////////////////////////////////////////////

      show: () => set({ visible: true }),

      // 오늘 하루 숨기기 로직 (자동으로 AsyncStorage에 저장됨)
      hideToday: async () => {
        const today = new Date().toDateString();
        set({ 
          hiddenUntil: today, 
          visible: false 
        });
      },

      check: async (notice: Notice | null) => {
        if ( ! notice) return;
        
        if ( ! notice.visflag) {
          set({ visible: false });
          return;
        }

        const today = new Date().toDateString();
        const { hiddenUntil, noticeId } = get();

        // 1. 공지 ID가 바뀌었거나 2. 저장된 날짜가 오늘이 아니면 표시
        if (noticeId !== notice.id || hiddenUntil !== today) {
          set({
            visible: true,
            noticeId: notice.id,
            notice: notice,
          });
        }
      },

      close: () => set({ visible: false }),
    }),

    ///////////////////////////////////////////////////////
    // persist 옵션 설정
    {
      name: 'notice-storage', // 저장소 키 이름
      storage: createJSONStorage(() => AsyncStorage), // React Native 환경 설정
      // partialize를 사용하면 저장하고 싶은 데이터만 골라서 저장할 수 있습니다.
      partialize: (state) => ({ 
        noticeId: state.noticeId, 
        hiddenUntil: state.hiddenUntil 
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true); // 데이터 로드 완료 시 true로 변경
      },
    }
  )
);