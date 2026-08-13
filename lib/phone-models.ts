export interface PhoneModelOption {
  value: string;
  label: string;
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
