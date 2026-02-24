import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeColors, setThemeColors] = useState(null);

  /**
   * Apply theme colors to CSS variables
   * @param {object} colors - Color scheme object from theme
   */
  const applyThemeColors = (colors) => {
    if (!colors) {
      resetThemeColors();
      return;
    }

    const root = document.documentElement;

    // Apply primary colors
    root.style.setProperty('--theme-primary', colors.primary || '#c49347');
    root.style.setProperty('--theme-secondary', colors.secondary || '#d4ab6a');
    root.style.setProperty('--theme-accent', colors.accent || '#b07d35');
    root.style.setProperty('--theme-gradient-start', colors.gradientStart || '#c49347');
    root.style.setProperty('--theme-gradient-end', colors.gradientEnd || '#b07d35');

    // Calculate RGB values for shadow effects
    const primaryRgb = hexToRgb(colors.primary || '#c49347');
    root.style.setProperty('--theme-primary-rgb', primaryRgb);

    // Auto-select text color based on luminance
    const textColor = getTextColor(colors.gradientStart || '#c49347');
    root.style.setProperty('--theme-text', textColor);

    setThemeColors(colors);
  };

  /**
   * Reset to default gold theme colors
   */
  const resetThemeColors = () => {
    const root = document.documentElement;

    root.style.setProperty('--theme-primary', '#c49347');
    root.style.setProperty('--theme-secondary', '#d4ab6a');
    root.style.setProperty('--theme-accent', '#b07d35');
    root.style.setProperty('--theme-gradient-start', '#c49347');
    root.style.setProperty('--theme-gradient-end', '#b07d35');
    root.style.setProperty('--theme-primary-rgb', '196, 147, 71');
    root.style.setProperty('--theme-text', '#ffffff');

    setThemeColors(null);
  };

  /**
   * Convert hex to RGB string
   */
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '196, 147, 71';

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `${r}, ${g}, ${b}`;
  };

  /**
   * Calculate relative luminance and return appropriate text color
   */
  const getTextColor = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '#ffffff';

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;

    // Return black for light backgrounds, white for dark
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Initialize with default colors on mount
  useEffect(() => {
    resetThemeColors();
  }, []);

  const value = {
    themeColors,
    applyThemeColors,
    resetThemeColors
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
