/**
 * Pass 7 — shared toast for chapter rail + demo jumps.
 */
type ToastHandler = (message: string) => void;

let handler: ToastHandler | null = null;

export function setVivaToastHandler(fn: ToastHandler | null): void {
  handler = fn;
}

export function showVivaToast(message: string): void {
  handler?.(message);
}
