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

