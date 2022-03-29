import allShadows from './shadows.json';

export const shadows = allShadows;

const root = document.querySelector(':root') as HTMLElement;
if (root) {
  for (const [key, value] of Object.entries(shadows)) {
    root.style.setProperty(`--${key}Shadow`, value);
  }
}
