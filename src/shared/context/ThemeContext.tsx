import React, { useEffect, useState } from 'react';

import { ThemeContext } from './theme-types';
import type { Theme } from './theme-types';

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'sarmad-ui-theme',
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect(() => {
        const root = window.document.documentElement;

        // Reset current classes
        root.classList.remove('light', 'dark');

        // Handle system theme
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
                .matches
                ? 'dark'
                : 'light';

            root.classList.add(systemTheme);
            return;
        }

        // Apply explicit theme
        root.classList.add(theme);
    }, [theme]);

    // Listen for system theme changes if using system preference
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const systemTheme = e.matches ? 'dark' : 'light';
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Compute isDark derived from DOM to avoid state synchronization issues
    useEffect(() => {
        const checkIsDark = () => {
            const isActuallyDark = window.document.documentElement.classList.contains('dark');
            if (isDark !== isActuallyDark) {
                setIsDark(isActuallyDark);
            }
        };
        checkIsDark(); // Initial check

        // Create an observer to watch for class changes on html
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    checkIsDark();
                }
            });
        });

        observer.observe(window.document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, [isDark]);

    const value = {
        theme,
        isDark,
        setTheme: (newTheme: Theme) => {
            localStorage.setItem(storageKey, newTheme);
            setTheme(newTheme);
        },
    };

    return (
        <ThemeContext.Provider {...props} value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
