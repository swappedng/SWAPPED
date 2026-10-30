"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AppointmentScheduler,
  AppointmentDetails,
  AppointmentFormData,
} from "../../../../components/tradein/AppointmentScheduler";

function SchedulePageContent() {
  const [isStepValid, setIsStepValid] = useState(false);
  const [appointmentData, setAppointmentData] =
    useState<AppointmentDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [appointmentFormData, setAppointmentFormData] =
    useState<AppointmentFormData>({
      appointmentType: {
        value: "house_call",
        label: "Certified Expert House Call",
      },
      date: null,
      time: null,
    });
  const router = useRouter();
  const searchParams = useSearchParams();
  const swapId = searchParams.get("swapId");

  const handleNext = async () => {
    if (!swapId) {
      setError(
        "Your swap details are missing. Please start the trade-in again.",
      );
      return;
    }
    if (!appointmentData) return;

    setIsSaving(true);
    setError("");
    try {
      // Move this fetch call to a server action or API route to avoid exposing sensitive data in the client
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          swapId,
          appointmentType: appointmentData.appointmentType.label,
          date: appointmentData.date,
          time: appointmentData.time,
        }),
      });

      if (response.ok) {
        router.push(`/tradein/confirm?swapId=${encodeURIComponent(swapId)}`);
      } else {
        const result = await response.json().catch(() => null);
        setError(
          result?.error ||
            "We could not save your appointment. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      setError("We could not save your appointment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-black hover:bg-gray-100 active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/swapped-logo.png" width={24} height={24} alt="" />
            <span className="text-xl tracking-tight">Swapped</span>
          </div>

          {/* Empty space for balance */}
          <div className="w-24"></div>
        </div>
      </header>

      <div className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="max-w-md mx-auto">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-black transition-all duration-500 ease-out w-full" />
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-black mb-3 tracking-tight">
                Schedule Your
                <span className="text-black font-light italic">
                  {" "}
                  Appointment
                </span>
              </h1>
              <p className="text-lg text-black/70 font-medium">
                Choose when we should inspect your device
              </p>
            </div>

            <AppointmentScheduler
              formData={appointmentFormData}
              setFormData={setAppointmentFormData}
              onDataChange={setAppointmentData}
              onValidationChange={setIsStepValid}
            />

            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleBack}
                className="
                  relative flex items-center justify-center px-8 py-4 flex-1
                  bg-gray-100 border-2 border-gray-200
                  rounded-2xl font-bold text-black text-lg tracking-wide
                  hover:bg-gray-200 transition-all duration-200
                "
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!isStepValid || isSaving}
                className="
                  relative flex items-center justify-center px-8 py-4 flex-1
                  bg-gradient-to-b from-[#1D1B1C] via-[#191718] to-[#252120]
                  rounded-2xl font-bold text-white text-lg tracking-wide
                  hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100
                  shadow-[inset_0px_0px_0.25px_1.25px_#262524,inset_3px_5px_2px_-4.75px_#FFFFFF,inset_1.25px_1.5px_0px_rgba(0,0,0,0.75),inset_0px_4.75px_0.25px_-2.5px_#FBFBFB,inset_1px_1px_3px_3px_#1A1818,inset_0px_-3px_1px_rgba(0,0,0,0.5),inset_2.5px_-2px_3px_rgba(124,108,94,0.75),inset_0px_-3px_3px_1px_rgba(255,245,221,0.1)]
                "
              >
                {isSaving ? "Saving..." : "Confirm & Finish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    // also add a loading.tsx so my fallback can be a skeleton loader instead of just "Loading..."
    <Suspense fallback={<div>Loading...</div>}>
      <SchedulePageContent />
    </Suspense>
  );
}
