import Link from "next/link";
import { getSwapMethodLabel } from "@/lib/api/types/enums";
import { getTradeInConfirmation } from "@/lib/api/endpoints/customer/server/tradein";

type ConfirmPageProps = {
  searchParams: Promise<{ swapId?: string | string[] }>;
};

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const { swapId } = await searchParams;
  const swap =
    typeof swapId === "string" ? await getTradeInConfirmation(swapId) : null;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-lg mx-auto">
        <div className="apple-card text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="apple-title mb-2">Trade-in Submitted!</h1>
            <p className="apple-body text-green-600 font-medium mb-2">
              Thank you for choosing SWAPPED
            </p>
            <p className="apple-body text-gray-600">
              We've received your request and will send you an email to confirm
              your appointment. The final price will be determined after our
              inspection.
            </p>
          </div>

          {swap ? (
            <div className="space-y-6 my-8">
              <div className="p-6 bg-gray-50 rounded-xl text-left">
                <h3 className="apple-headline mb-4">Swap Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="apple-body text-gray-600">
                      Trade-in Value:
                    </span>
                    <span className="apple-body font-medium">
                      ₦{swap.tradeInValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="apple-body text-gray-600">
                      New Phone Price:
                    </span>
                    <span className="apple-body font-medium">
                      ₦{swap.upgradePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="apple-body text-gray-900 font-medium">
                      Amount to Pay:
                    </span>
                    <span className="apple-body font-bold text-blue-600">
                      ₦{swap.amountToPay.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {swap.appointment && (
                <div className="p-6 bg-green-50 rounded-xl text-left">
                  <h3 className="apple-headline mb-4">Appointment Scheduled</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="apple-body text-gray-600">
                        Swap method:
                      </span>
                      <span className="apple-body font-medium">
                        {getSwapMethodLabel(swap.appointment.swapMethod)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="apple-body text-gray-600">Date:</span>
                      <span className="apple-body font-medium">
                        {swap.appointment.date.toLocaleDateString("en-NG")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="apple-body text-gray-600">Time:</span>
                      <span className="apple-body font-medium">
                        {swap.appointment.time}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {swap.contactEmail && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="apple-footnote text-blue-800">
                    We'll send updates to: <strong>{swap.contactEmail}</strong>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="my-8 p-6 bg-yellow-50 rounded-xl">
              <p className="apple-body text-yellow-800">
                Could not retrieve swap details at this time.
              </p>
            </div>
          )}

          <Link href="/tradein" className="apple-button-primary inline-block">
            Start New Trade-in
          </Link>
        </div>
      </div>
    </div>
  );
}
