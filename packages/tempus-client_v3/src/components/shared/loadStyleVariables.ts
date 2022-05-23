import type { colors } from './Colors';
import type { shadows } from './Shadow';

export default function loadStyleVariables(styles: typeof colors | typeof shadows, suffix = ''): void {
  const root = document.querySelector(':root') as HTMLElement;

  if (root) {
    Object.entries(styles).forEach(([key, value]) => {
      root.style.setProperty(`--${key}${suffix}`, value);
    });
  }
}
