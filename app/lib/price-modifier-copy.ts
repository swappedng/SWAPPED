/** Plain-language explanation for multiplicative assessment modifiers (each step multiplies running value). */
export function priceModifierSummary(mod: number): string {
  const pct = Math.round(mod * 1000) / 10;
  if (Math.abs(mod - 1) < 1e-9) {
    return "No change at this step — keeps 100% of the value so far.";
  }
  return `Keeps about ${pct}% of the trade-in value calculated before this answer (then later questions apply on top).`;
}

/** Single overall condition multiplies the starting phone value once (legacy flow). */
export function legacyConditionModifierSummary(mod: number): string {
  const pct = Math.round(mod * 1000) / 10;
  if (Math.abs(mod - 1) < 1e-9) {
    return "Keeps the full starting trade-in value (100%).";
  }
  return `Keeps about ${pct}% of the phone’s starting trade-in value (before assessment questions or promotions).`;
}
