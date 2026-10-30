import { httpClient } from '../../httpClient';
import { CreatedTradeInRequest, CreateTradeInAppointmentRequest, CreateTradeInRequest, TradeInAppointment } from '../../types/tradein';

export function createTradeInRequest(payload: CreateTradeInRequest) {
  return httpClient.post<CreatedTradeInRequest, CreateTradeInRequest>('/api/swaps', payload);
}

export function createTradeInAppointment(payload: CreateTradeInAppointmentRequest) {
  return httpClient.post<TradeInAppointment, CreateTradeInAppointmentRequest>('/api/appointments', payload);
}
