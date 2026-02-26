import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeProviderState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
}

const initialState: ThemeProviderState = {
    theme: 'system',
    setTheme: () => null,
    isDark: false,
};

export const ThemeContext = createContext<ThemeProviderState>(initialState);
