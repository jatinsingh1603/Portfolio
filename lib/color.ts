/**
 * Contrast maths for the token audit. Small and dependency-free on purpose:
 * this runs in a unit test that gates the build, so it should not be able to
 * break because of an upstream package.
 */

export type Rgb = { r: number; g: number; b: number };

export function parseColor(input: string): Rgb {
  const value = input.trim();

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex?.[1]) {
    const h =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((c) => c + c)
            .join("")
        : hex[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  const rgba = /^rgba?\(([^)]+)\)$/i.exec(value);
  if (rgba?.[1]) {
    const parts = rgba[1].split(",").map((p) => Number(p.trim()));
    const [r, g, b] = parts;
    if (r === undefined || g === undefined || b === undefined) {
      throw new Error(`Unparseable colour: ${input}`);
    }
    return { r, g, b };
  }

  throw new Error(`Unparseable colour: ${input}`);
}

/** Flattens a translucent colour over an opaque background. */
export function composite(fg: string, alpha: number, bg: Rgb): Rgb {
  const f = parseColor(fg);
  return {
    r: f.r * alpha + bg.r * (1 - alpha),
    g: f.g * alpha + bg.g * (1 - alpha),
    b: f.b * alpha + bg.b * (1 - alpha),
  };
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string | Rgb, b: string | Rgb): number {
  const la = luminance(typeof a === "string" ? parseColor(a) : a);
  const lb = luminance(typeof b === "string" ? parseColor(b) : b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
