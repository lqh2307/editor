export function getValue(key: string): any {
  const value: string = localStorage.getItem(key);

  return value ? JSON.parse(value) : undefined;
}

export function setValue(key: string, value: any): void {
  return localStorage.setItem(key, JSON.stringify(value));
}

export function clearValue(key: string): void {
  return localStorage.removeItem(key);
}
