export enum SwapMethod {
  WALK_IN = 'WALK_IN',
  HOME_PICKUP = 'HOME_PICKUP',
  COURIER = 'COURIER',
}

export enum ConditionType {
  BATTERY = 'battery',
  SCREEN = 'screen',
  FACE_ID = 'faceid',
  BACK_GLASS = 'backglass',
  BODY = 'body',
  SIM = 'sim',
}

export enum PriceModifierType {
  AMOUNT = 'AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
}

export enum SwapStatus {
  SUBMITTED = 'SUBMITTED',
  INSPECTION_SCHEDULED = 'INSPECTION_SCHEDULED',
  UNDER_INSPECTION = 'UNDER_INSPECTION',
  AWAITING_CUSTOMER_APPROVAL = 'AWAITING_CUSTOMER_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FULFILMENT_IN_PROGRESS = 'FULFILMENT_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SwapOfferStatus {
  ORIGINAL = 'ORIGINAL',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  SUPERSEDED = 'SUPERSEDED',
}

/** Human-readable labels for SwapStatus values */
export const SWAP_STATUS_LABELS: Record<SwapStatus, string> = {
  [SwapStatus.SUBMITTED]: 'Submitted',
  [SwapStatus.INSPECTION_SCHEDULED]: 'Inspection Scheduled',
  [SwapStatus.UNDER_INSPECTION]: 'Under Inspection',
  [SwapStatus.AWAITING_CUSTOMER_APPROVAL]: 'Awaiting Customer Approval',
  [SwapStatus.APPROVED]: 'Approved',
  [SwapStatus.REJECTED]: 'Rejected',
  [SwapStatus.FULFILMENT_IN_PROGRESS]: 'Fulfilment in Progress',
  [SwapStatus.COMPLETED]: 'Completed',
  [SwapStatus.CANCELLED]: 'Cancelled',
};

/** Valid status transitions: key → set of allowed next statuses */
export const VALID_STATUS_TRANSITIONS: Record<SwapStatus, SwapStatus[]> = {
  [SwapStatus.SUBMITTED]: [
    SwapStatus.INSPECTION_SCHEDULED,
    SwapStatus.CANCELLED,
  ],
  [SwapStatus.INSPECTION_SCHEDULED]: [
    SwapStatus.UNDER_INSPECTION,
    SwapStatus.CANCELLED,
  ],
  [SwapStatus.UNDER_INSPECTION]: [
    SwapStatus.AWAITING_CUSTOMER_APPROVAL,
    SwapStatus.APPROVED,
    SwapStatus.CANCELLED,
  ],
  [SwapStatus.AWAITING_CUSTOMER_APPROVAL]: [
    SwapStatus.APPROVED,
    SwapStatus.REJECTED,
    SwapStatus.CANCELLED,
  ],
  [SwapStatus.APPROVED]: [SwapStatus.FULFILMENT_IN_PROGRESS, SwapStatus.CANCELLED],
  [SwapStatus.REJECTED]: [],
  [SwapStatus.FULFILMENT_IN_PROGRESS]: [SwapStatus.COMPLETED, SwapStatus.CANCELLED],
  [SwapStatus.COMPLETED]: [],
  [SwapStatus.CANCELLED]: [],
};

// Helper function to get display label for swap method
export function getSwapMethodLabel(method: SwapMethod): string {
  switch (method) {
    case SwapMethod.WALK_IN:
      return 'Store Visit';
    case SwapMethod.HOME_PICKUP:
      return 'Home Pickup';
    case SwapMethod.COURIER:
      return 'Courier Pickup';
    default:
      return method;
  }
}


