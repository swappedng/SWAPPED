"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/components/home/Brand";
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
    <main className="min-h-screen bg-background px-4 py-6 text-[#192331] sm:px-6">
      <header className="mx-auto mb-8 flex h-16 max-w-[1640px] items-center justify-start px-1 sm:px-3">
        <Brand />
      </header>
      <AppointmentScheduler
        formData={appointmentFormData}
        setFormData={setAppointmentFormData}
        swapId={swapId}
        onBack={handleBack}
        onComplete={handleComplete}
      />
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
