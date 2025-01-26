"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

import { getCookie, setCookie } from 'cookies-next';

export enum ColorMode {
    LIGHT = 'light',
    DARK = 'dark',
}

interface ColorModeContextType {
    mode: ColorMode;
    setMode: (mode: ColorMode) => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
    mode: ColorMode.DARK,
    setMode: () => {},
});

export const ColorModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [mode, setMode] = useState<ColorMode>(ColorMode.DARK);

    useEffect(() => {
		const theme = getCookie('theme');
        setMode(theme === 'dark' ? ColorMode.DARK : ColorMode.LIGHT);
	}, []);

    useEffect(() => {
		if (mode === ColorMode.DARK) {
			document.documentElement.classList.add('dark');
			setCookie('theme', ColorMode.DARK);
		} else {
			document.documentElement.classList.remove('dark');
			setCookie('theme', ColorMode.LIGHT);
		}
	}, [mode]);

    return (
        <ColorModeContext.Provider value={{ mode, setMode }}>
            {children}
        </ColorModeContext.Provider>
    );
};

export const useColorMode = () => useContext(ColorModeContext);