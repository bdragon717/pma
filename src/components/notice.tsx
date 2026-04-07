/**
 * Notice GITHUB
 */

import { useNoticeStore } from '@/src/store/useNoticeStore';
import { Notice } from '@/src/utils/types';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/bdragon717/pma/main/notice.json';

export async function fetchAndCheckNotice() {
    const { check, hydrated } = useNoticeStore.getState();

    try {
      const response = await fetch(`${GITHUB_RAW_URL}?t=${Date.now()}`);
      if ( ! response.ok) {
        throw new Error('공지사항 fetch 실패');
      }

      const data: Notice = await response.json();

      if (hydrated) {
        check(data);
      } else {
        console.log('스토어가 아직 준비되지 않았습니다.');
      }
  } catch (error) {
    console.log('공지사항 조회 실패:', error);
    return null;
  }
}