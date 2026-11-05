"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  AppointmentScheduler,
  AppointmentDetails,
  AppointmentFormData,
} from "@/components/tradein/ui/AppointmentScheduler";

function SchedulePageContent() {
  const [appointmentFormData, setAppointmentFormData] =
    useState<AppointmentFormData>({
      date: null,
      time: null,
    });
  const [appointmentData, setAppointmentData] =
    useState<AppointmentDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const swapId = searchParams.get("swapId");

  const handleComplete = () => {
    router.push(`/tradein/confirm?swapId=${encodeURIComponent(swapId || "")}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-[#192331] sm:px-6 sm:py-0">
      <div className="mx-auto max-w-2xl pt-16">
        <section
          aria-labelledby="schedule-title"
          className=" "
        >
          <div className=" px-5 py-7 sm:px-9 sm:py-8">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-sm text-[#69717d] hover:text-[#192331] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <AppointmentScheduler
              formData={appointmentFormData}
              setFormData={setAppointmentFormData}
              onDataChange={setAppointmentData}
              onValidationChange={() => {}}
              swapId={swapId}
              onComplete={handleComplete}
              isSaving={isSaving}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading...</div>}>
      <SchedulePageContent />
    </Suspense>
  );
}
