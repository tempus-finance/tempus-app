export function capitalize(value: string): string {
  if (value && value.length > 0) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  } else {
    return value;
  }
}
