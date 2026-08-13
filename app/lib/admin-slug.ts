/** Lowercase slug for URLs / internal ids: letters, digits, hyphens only. */
export function slugifyPart(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Typical trade-in phone value: model slug + storage slug, e.g. iphone-15-pro + 256gb → combined */
export function suggestedPhoneValue(model: string, storage: string): string {
  const a = slugifyPart(model);
  const b = slugifyPart(storage);
  if (!a && !b) return "";
  if (!a) return b;
  if (!b) return a;
  return `${a}-${b}`;
}
