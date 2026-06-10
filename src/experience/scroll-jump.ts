/**
 * Pass 6 — instant scroll jump for viva demo bookmarks.
 */
import { clamp01 } from '@/story/scroll-math';

export function progressToScrollTop(section: HTMLElement, progress: number): number {
  const scrollable = section.offsetHeight - window.innerHeight;
  return section.offsetTop + scrollable * clamp01(progress);
}
