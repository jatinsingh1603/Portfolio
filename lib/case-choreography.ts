/** Scroll is the timeline. These curves never alter native scrolling. */
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const segment = (value: number, start: number, end: number) =>
  clamp((value - start) / (end - start));
export const smooth = (value: number) => value * value * (3 - 2 * value);
export const chapterAt = (progress: number) =>
  progress < 0.29 ? 0 : progress < 0.54 ? 1 : progress < 0.78 ? 2 : 3;
export const chapterStops = [0, 0.4, 0.65, 0.89] as const;
export function exposure(progress: number, start: number, end: number) {
  return (
    smooth(segment(progress, start, start + 0.07)) *
    (1 - smooth(segment(progress, end - 0.05, end)))
  );
}
