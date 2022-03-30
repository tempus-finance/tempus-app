export default function loadStyleVariables(styles: object, suffix: string = '') {
  const root = document.querySelector(':root') as HTMLElement;

  if (root) {
    for (const [key, value] of Object.entries(styles)) {
      root.style.setProperty(`--${key}${suffix}`, value);
    }
  }
}
