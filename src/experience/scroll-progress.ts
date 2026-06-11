/**
 * Native scroll → global progress (0..1). Uses non-linear scroll map when
 * conductor is active; linear 1:1 when reduced motion.
 */
export { readScrollProgress, scrollTopToProgress } from '@/experience/scroll-map';
