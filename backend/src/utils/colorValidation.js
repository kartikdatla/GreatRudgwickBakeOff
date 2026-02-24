/**
 * Color validation utilities for theme colors
 * Ensures accessibility and proper formatting
 */

/**
 * Validate hex color format
 * @param {string} color - Hex color string
 * @returns {boolean}
 */
const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Convert hex to RGB
 * @param {string} hex - Hex color string
 * @returns {object} RGB values
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Calculate relative luminance
 * @param {object} rgb - RGB values
 * @returns {number} Luminance value
 */
const getLuminance = (rgb) => {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @returns {number} Contrast ratio
 */
const getContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if color meets WCAG AA standards
 * @param {string} bgColor - Background color
 * @param {string} textColor - Text color
 * @returns {boolean}
 */
const meetsWCAGAA = (bgColor, textColor) => {
  const contrast = getContrastRatio(bgColor, textColor);
  return contrast >= 4.5; // WCAG AA standard for normal text
};

/**
 * Auto-select appropriate text color (white or black) for given background
 * @param {string} bgColor - Background hex color
 * @returns {string} '#ffffff' or '#000000'
 */
const getTextColor = (bgColor) => {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return '#ffffff';

  const luminance = getLuminance(rgb);
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Validate complete color scheme
 * @param {object} colors - Color scheme object
 * @returns {object} Validation result with errors/warnings
 */
const validateColorScheme = (colors) => {
  const errors = [];
  const warnings = [];

  // Check required fields
  const required = ['color_primary', 'color_secondary', 'color_accent', 'color_gradient_start', 'color_gradient_end'];
  required.forEach(field => {
    if (!colors[field]) {
      errors.push(`Missing required field: ${field}`);
    } else if (!isValidHexColor(colors[field])) {
      errors.push(`Invalid hex color for ${field}: ${colors[field]}`);
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Check contrast ratios
  const textColor = getTextColor(colors.color_primary);
  if (!meetsWCAGAA(colors.color_primary, textColor)) {
    warnings.push('Primary color may have poor contrast with auto-selected text color');
  }

  if (!meetsWCAGAA(colors.color_gradient_start, textColor)) {
    warnings.push('Gradient start color may have poor contrast with text');
  }

  return {
    valid: true,
    errors: [],
    warnings,
    suggestedTextColor: textColor
  };
};

/**
 * Get RGB string for CSS variable usage
 * @param {string} hex - Hex color
 * @returns {string} RGB values (e.g., "93, 64, 55")
 */
const hexToRgbString = (hex) => {
  const rgb = hexToRgb(hex);
  return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '196, 147, 71';
};

module.exports = {
  isValidHexColor,
  hexToRgb,
  getContrastRatio,
  meetsWCAGAA,
  getTextColor,
  validateColorScheme,
  hexToRgbString
};
