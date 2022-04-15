export function getCookie(cookieName: string): string {
  const cookieData = document.cookie.match(`(^|;)\\s*${cookieName}\\s*=\\s*([^;]+)`)?.pop() || '';

  return cookieData.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
}
