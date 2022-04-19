const prefix = 'TC_';

export class StorageService {
  static set(key: string, value: string | number | Record<string, unknown>): void {
    if (!key || !value) {
      return;
    }

    let stringifiedValue: string | undefined;
    if (typeof value === 'object') {
      stringifiedValue = JSON.stringify(value);
    } else {
      stringifiedValue = value.toString();
    }

    localStorage.setItem(`${prefix}${key}`, stringifiedValue);
  }

  static get(key: string): string | Record<string, unknown> {
    let value = localStorage.getItem(`${prefix}${key}`);
    if (!value) {
      return '';
    }

    if (value === null) {
      return '';
    }

    if (value[0] === '{' || value[0] === '[') {
      value = JSON.parse(value);
    }

    return value || '';
  }

  static delete(key: string): void {
    localStorage.removeItem(`${prefix}${key}`);
  }

  static clear(): void {
    localStorage.clear();
  }
}
