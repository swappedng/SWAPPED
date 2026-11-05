"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AppointmentScheduler,
  AppointmentFormData,
} from "@/components/tradein/ui/AppointmentScheduler";

function SchedulePageContent() {
  const [appointmentFormData, setAppointmentFormData] =
    useState<AppointmentFormData>({
      date: null,
      time: null,
    });
  const router = useRouter();
  const searchParams = useSearchParams();
  const swapId = searchParams.get("swapId");

  const handleComplete = () => {
    router.push(`/tradein/confirm?swapId=${encodeURIComponent(swapId || "")}`);
  };

  const handleBack = () => {
    router.push('/tradein');
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-[#192331] sm:px-6 sm:py-0">
      <div className="mx-auto max-w-2xl pt-16">
        <section
          aria-labelledby="schedule-title"
          className=" "
        >
          <div className=" px-5 py-7 sm:px-9 sm:py-8">
            <AppointmentScheduler
              formData={appointmentFormData}
              setFormData={setAppointmentFormData}
              swapId={swapId}
              onBack={handleBack}
              onComplete={handleComplete}
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
