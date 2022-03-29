import colorScheme from './colors.json';

export const colors = colorScheme;

const root = document.querySelector(':root') as HTMLElement;
if (root) {
  for (const [key, value] of Object.entries(colors)) {
    root.style.setProperty(`--${key}`, value);
  }
}

// Required by TS - we need at least one export or import so that TS considers this file a module
export {};
