/**
 * Native scroll → global progress (0..1). One formula, no Lenis, no Framer
 * useScroll — everything reads the same value so 3D and copy stay locked.
 */
import { clamp01 } from '@/story/scroll-math';

export function readScrollProgress(section: HTMLElement): number {
  const scrollable = section.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return clamp01((window.scrollY - section.offsetTop) / scrollable);
}
