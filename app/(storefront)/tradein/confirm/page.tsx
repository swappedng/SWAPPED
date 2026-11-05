import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ConfirmPageProps = {
  searchParams: Promise<{ swapId?: string | string[] }>;
};

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const { swapId } = await searchParams;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-lg mx-auto">
        <Link
          href="/tradein"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to trade-in
        </Link>
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


          <Link href="/tradein" className="apple-button-primary inline-block">
            Start New Trade-in
          </Link>
        </div>
      </div>
    </div>
  );
}
