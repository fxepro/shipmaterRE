/**
 * Canonical desktop type scale — docs/Font sizes + frontend-design-layout-standard §6.
 * Core six: H1–H5 + Body. Everything else is an exception.
 */

export const TYPE = {
  /* ── Core ─────────────────────────────────────────────────────────────── */
  h1: 48,
  h2: 40,
  h3: 32,
  h4: 28,
  h5: 24,
  body: 16,

  /* ── Exceptions ───────────────────────────────────────────────────────── */
  displayXl: 72,
  displayL: 60,
  h6: 20,
  bodyLg: 18,
  bodySm: 14,
  caption: 13,
  fine: 12,
} as const;

/**
 * Marketing inline scale — maps local `T.*` keys to the doc.
 * `hero` = Display L (exception), fluid between H1 and Display L.
 * `label` / `fine` = Caption / Fine Print (exceptions).
 */
export const T = {
  hero: 'clamp(48px, 5vw, 60px)' as string | number,
  h1: TYPE.h1,
  h2: TYPE.h2,
  h3: TYPE.h3,
  h4: TYPE.h4,
  h5: TYPE.h5,
  body: TYPE.body,
  label: TYPE.caption,
  fine: TYPE.fine,
} as const;
