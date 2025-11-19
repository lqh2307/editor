export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  delay: number
): [(...args: Parameters<T>) => void, () => void] {
  let timeoutId: NodeJS.Timeout;

  const debounced = function (...args: Parameters<T>): void {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => func(...args), delay);
  };

  const cancel = () => {
    clearTimeout(timeoutId);
  };

  return [debounced, cancel];
}
