// WCAG 2.1 Color Contrast Utilities

const NAMED_COLORS: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  gray: '#808080',
  grey: '#808080',
  lightgray: '#d3d3d3',
  darkgray: '#a9a9a9',
  silver: '#c0c0c0',
  orange: '#ffa500',
  purple: '#800080',
  navy: '#000080',
  teal: '#008080',
  lime: '#00ff00',
  maroon: '#800000',
  olive: '#808000',
  aqua: '#00ffff',
  transparent: '#ffffff', // fallback assumption
};

export interface RGB {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export function parseColor(colorStr: string): RGB | null {
  if (!colorStr) return null;
  const str = colorStr.trim().toLowerCase();

  if (NAMED_COLORS[str]) {
    return parseColor(NAMED_COLORS[str]);
  }

  // Hex: #abc or #aabbcc or #aabbccdd
  if (str.startsWith('#')) {
    const hex = str.slice(1);
    if (hex.length === 3) {
      return {
        r: Number.parseInt(hex[0] + hex[0], 16),
        g: Number.parseInt(hex[1] + hex[1], 16),
        b: Number.parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
      };
    }
    if (hex.length === 8) {
      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
        a: Number.parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
  }

  // rgb(...) or rgba(...)
  const rgbMatch = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    return {
      r: Number.parseInt(rgbMatch[1], 10),
      g: Number.parseInt(rgbMatch[2], 10),
      b: Number.parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] ? Number.parseFloat(rgbMatch[4]) : 1,
    };
  }

  return null;
}

/**
 * Computes WCAG 2.1 relative luminance (0 to 1)
 */
export function getRelativeLuminance(rgb: RGB): number {
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(val => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Computes WCAG 2.1 contrast ratio between two colors: (L1 + 0.05) / (L2 + 0.05)
 */
export function getContrastRatio(color1: RGB, color2: RGB): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Extracts inline style colors from an element's style attribute
 */
export function extractInlineColors(styleAttr?: string): { color?: string; backgroundColor?: string } {
  if (!styleAttr) return {};
  const res: { color?: string; backgroundColor?: string } = {};

  const declarations = styleAttr.split(';');
  for (const decl of declarations) {
    const [prop, val] = decl.split(':').map(s => s?.trim());
    if (!prop || !val) continue;

    if (prop === 'color') {
      res.color = val;
    } else if (prop === 'background-color' || prop === 'background') {
      // If simple color value
      res.backgroundColor = val;
    }
  }

  return res;
}
