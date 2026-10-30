export interface PhoneModelOption {
  value: string;
  label: string;
  model?: string;
  storage?: string;
  basePrice?: number;
}

let phoneModelsRequest: Promise<PhoneModelOption[]> | undefined;

/**
 * Keeps one in-browser request alive across the home and trade-in pages, so
 * the model list is normally ready before the customer opens the form.
 */
export function loadPhoneModels() {
  if (!phoneModelsRequest) {
    phoneModelsRequest = fetch('/api/admin/phone-models')
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to fetch phone models');
        return response.json() as Promise<PhoneModelOption[]>;
      })
      .catch((error) => {
        // Allow a later visit to retry after a temporary network failure.
        phoneModelsRequest = undefined;
        throw error;
      });
  }

  return phoneModelsRequest;
}

export const modelNumber = (name: string) => {
  const numeric = name.match(/iPhone\s+(\d+)/i)?.[1];
  if (numeric) return Number(numeric);
  if (/iPhone\s+XS/i.test(name)) return 10.2;
  if (/iPhone\s+XR/i.test(name)) return 10.1;
  if (/iPhone\s+X/i.test(name)) return 10;
  return -1;
};

export const modelGroup = (name: string) =>
  name.match(/iPhone\s+(\d+)/i)?.[1] ||
  name.match(/iPhone\s+(XS|XR|X)/i)?.[1] ||
  '';

export const generation = (name: string) =>
  Number(name.match(/iPhone\s+(\d+)/i)?.[1] || 0);

export const rank = (name: string) =>
  generation(name) * 10 +
  (name.includes("Pro Max")
    ? 3
    : name.includes(" Pro")
      ? 2
      : name.includes("Plus")
        ? 1
        : name.includes("mini")
          ? -1
          : 0);
