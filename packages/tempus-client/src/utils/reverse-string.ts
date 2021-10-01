export const reverseString = (value: string | undefined): string => (value ? value.split('').reverse().join('') : '');
