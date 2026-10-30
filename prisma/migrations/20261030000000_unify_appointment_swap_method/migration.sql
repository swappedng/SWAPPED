-- Appointments use the same fulfillment choices as swaps. Preserve every
-- existing appointment while normalizing the old naming and enum values.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SwapMethod') THEN
    CREATE TYPE "SwapMethod" AS ENUM ('WALK_IN', 'HOME_PICKUP', 'COURIER');
  END IF;
END $$;

ALTER TABLE "Appointment" ADD COLUMN "swapMethod" "SwapMethod";

UPDATE "Appointment" AS appointment
SET "swapMethod" = CASE appointment."appointmentType"::text
  WHEN 'STORE_VISIT' THEN 'WALK_IN'::"SwapMethod"
  WHEN 'WALK_IN' THEN 'WALK_IN'::"SwapMethod"
  WHEN 'walk_in' THEN 'WALK_IN'::"SwapMethod"
  WHEN 'Walk-in Customer' THEN 'WALK_IN'::"SwapMethod"
  WHEN 'HOME_PICKUP' THEN 'HOME_PICKUP'::"SwapMethod"
  WHEN 'house_call' THEN 'HOME_PICKUP'::"SwapMethod"
  WHEN 'Certified Expert House Call' THEN 'HOME_PICKUP'::"SwapMethod"
  WHEN 'COURIER_PICKUP' THEN 'COURIER'::"SwapMethod"
  WHEN 'COURIER' THEN 'COURIER'::"SwapMethod"
  WHEN 'dispatch_pickup' THEN 'COURIER'::"SwapMethod"
  WHEN 'Dispatch Pickup' THEN 'COURIER'::"SwapMethod"
  ELSE swap."swapMethod"
END
FROM "Swap" AS swap
WHERE appointment."swapId" = swap.id;

ALTER TABLE "Appointment" ALTER COLUMN "swapMethod" SET NOT NULL;
ALTER TABLE "Appointment" DROP COLUMN "appointmentType";
DROP TYPE IF EXISTS "AppointmentType";
