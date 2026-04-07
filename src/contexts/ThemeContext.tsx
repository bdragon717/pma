/**
 * Theme Context
 */

import { getCommonStyles } from '@/src/utils/CommonStyles';
import { colors, fonts, sizes, spacings } from '@/src/utils/Theme';
import React, { createContext, useContext, useMemo } from 'react';

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
    const value = useMemo(() => ({colors,
                                  fonts,
                                  sizes,
                                  spacings,    
                                  styles: getCommonStyles(colors,
                                                          fonts,
                                                          sizes,
                                                          spacings) // 테마 데이터를 넣어 완성된 스타일 객체를 생성
    }), []);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme는 ThemeProvider 내에서 사용해야 합니다.');
  }
  return ctx;
};