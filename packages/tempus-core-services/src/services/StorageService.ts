const prefix = 'TC_';

export class StorageService {
  set(key: string, value: string | number | object) {
    if (!key || !value) {
      return;
    }

    if (typeof value === 'object') {
      value = JSON.stringify(value);
    } else {
      value = value.toString();
    }

    localStorage.setItem(`${prefix}${key}`, value);
  }

  get(key: string): string | object | undefined {
    let value = localStorage.getItem(`${prefix}${key}`);
    if (!value) {
      return;
    }

    if (value === null) {
      return;
    }

    if (value[0] === '{' || value[0] === '[') {
      value = JSON.parse(value);
    }

    return value || undefined;
  }

  delete(key: string) {
    localStorage.removeItem(`${prefix}${key}`);
  }

  clear() {
    localStorage.clear();
  }
}
