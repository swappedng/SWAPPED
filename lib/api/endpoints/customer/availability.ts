import { httpClient } from '../../httpClient';
import { AvailabilityBlock } from '../../types/tradein';

export function getAvailability() {
  return httpClient.get<AvailabilityBlock[]>('/api/availability');
}
