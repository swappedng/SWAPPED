"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getAvailability } from "@/lib/api/endpoints/customer/availability";
import { createTradeInAppointment } from "@/lib/api/endpoints/customer/tradein";
import { AvailabilityBlock } from "@/lib/api/types/tradein";
import { Button } from "@/components/ui/button";

export interface AppointmentDetails {
  date: Date | null;
  time: string | null;
}

export interface AppointmentFormData {
  date: Date | null;
  time: string | null;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Default availability: 8 AM - 5 PM WAT (UTC+1), Monday - Friday
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 17;

export function AppointmentScheduler({
  formData,
  setFormData,
  swapId,
  onBack,
  onComplete,
}: {
  formData: AppointmentFormData;
  setFormData: (data: AppointmentFormData) => void;
  swapId: string | null;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [availabilityBlocks, setAvailabilityBlocks] = useState<
    AvailabilityBlock[]
  >([]);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const blocks = await getAvailability();
        setAvailabilityBlocks(blocks);
      } catch (error) {
        console.error("Failed to load availability:", error);
        // Continue with empty availability blocks (will use defaults)
        setAvailabilityBlocks([]);
      }
    };
    loadAvailability();
  }, []);

  const { date, time } = formData;

  const handleNext = async () => {
    if (!swapId) {
      setError("Your swap details are missing. Please start the trade-in again.");
      return;
    }
    if (!date || !time || isSaving) return;

    setIsSaving(true);
    setError("");
    try {
      await createTradeInAppointment({
        swapId,
        date: date.toISOString(),
        time,
      });
      localStorage.removeItem("tradeInFlowState");
      onComplete();
    } catch (error) {
      console.error("Error saving appointment:", error);
      setError("We could not save your appointment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getBlockForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return availabilityBlocks.find((b) => b.date === dateStr);
  };

  const isDateUnavailable = (date: Date) => {
    const block = getBlockForDate(date);
    // If there's a block and isUnavailable is true, the entire day is unavailable
    if (block?.isUnavailable) return true;

    // Weekends are unavailable by default
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;

    // Past dates are unavailable
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const getTimeSlots = (selectedDate: Date) => {
    const block = getBlockForDate(selectedDate);

    const slots: {
      label: string;
      hour: number;
      minute: number;
      disabled: boolean;
    }[] = [];
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    for (let hour = DEFAULT_START_HOUR; hour < DEFAULT_END_HOUR; hour++) {
      if (
        block &&
        !block.isUnavailable &&
        block.unavailableStartHour != null &&
        block.unavailableEndHour != null &&
        hour >= block.unavailableStartHour &&
        hour < block.unavailableEndHour
      ) {
        continue;
      }

      const minute = 0;
      const isPast =
        isToday &&
        (hour < now.getHours() ||
          (hour === now.getHours() && minute < now.getMinutes()));
      const period = hour >= 12 ? "pm" : "am";
      const displayHour = hour % 12 || 12;
      const label = `${displayHour}:00 ${period}`;

      slots.push({ label, hour, minute, disabled: isPast });
    }

    return slots;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = (firstDay.getDay() + 6) % 7; // Adjust for Monday start
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateClick = (selectedDate: Date) => {
    if (isDateUnavailable(selectedDate)) return;

    setFormData({
      ...formData,
      date: selectedDate,
      time: null, // Reset time when date changes
    });
    setViewMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
  };

  const handleTimeClick = (slot: { label: string; disabled: boolean }) => {
    if (slot.disabled) return;
    setFormData({
      ...formData,
      time: slot.label,
    });
  };

  const goToPreviousMonth = () => {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = getDaysInMonth(viewMonth);
  const availableTimeSlots = date ? getTimeSlots(date) : [];
  const selectedDayName = date ? DAYS[(date.getDay() + 6) % 7] : "";

  const formatLongDate = (d: Date) => {
    return `${DAYS[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e7e2eb] bg-[#fffdfb] p-5 shadow-[0_20px_50px_rgba(25,35,49,0.05)] sm:p-7">
      {/* Header */}
      <div className="mb-5 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#69717d] transition-colors hover:text-[#192331]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-[#192331] sm:text-xl">
            Book an appointment
          </h1>
          <p className="text-sm leading-relaxed text-[#69717d]">
            Pick a day, then choose a time.
          </p>
        </div>
      </div>

      {/* Body - Calendar and Time Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
        {/* Calendar Section - Fixed width */}
        <div className="w-full max-w-[360px]">
          {/* Calendar header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              disabled={
                viewMonth.getFullYear() === today.getFullYear() &&
                viewMonth.getMonth() === today.getMonth()
              }
              className="w-8 h-8 rounded-lg border border-[#e7e2eb] flex items-center justify-center text-[#69717d] hover:bg-[#f3f2f8] disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-semibold text-[#192331]">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </h2>
            <button
              type="button"
              onClick={goToNextMonth}
              className="w-8 h-8 rounded-lg border border-[#e7e2eb] flex items-center justify-center text-[#69717d] hover:bg-[#f3f2f8]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day names */}
          <div className="mb-1 grid grid-cols-7 gap-1 text-center">
            {DAYS.map((day) => (
              <div key={day} className="py-1.5 text-xs text-[#69717d]">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="aspect-square" />;
              }

              const isUnavailable = isDateUnavailable(day);
              const isSelected =
                date && day.toDateString() === date.toDateString();
              const isToday = day.toDateString() === today.toDateString();
              const isOtherMonth = day.getMonth() !== viewMonth.getMonth();

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={isUnavailable}
                  className={`
                    h-8 w-full rounded-full flex items-center justify-center text-sm
                    transition-colors relative
                    ${isUnavailable ? "text-[#b4b4be] cursor-default" : "hover:bg-[#f3f2f8] cursor-pointer"}
                    ${isOtherMonth ? "text-[#b4b4be]" : ""}
                    ${isSelected ? "bg-[#4c00bd] text-white font-semibold" : ""}
                    ${isToday && !isSelected ? 'after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[#4c00bd]' : ""}
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Panel */}
        {date && (
          <div className="min-w-0 border-t border-[#e7e2eb] pt-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <h3 className="text-sm font-semibold text-[#192331] mb-1">
              {selectedDayName}, {date?.getDate()}{" "}
              {date ? MONTHS[date.getMonth()].slice(0, 3) : ""}
            </h3>
            <p className="text-xs text-[#69717d] mb-3">8:00 am – 5:00 pm</p>

            <div
              className="max-h-56 space-y-2 overflow-y-auto pr-2 no-scf"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, #000 calc(100% - 20px), transparent)",
                maskImage:
                  "linear-gradient(to bottom, #000 calc(100% - 20px), transparent)",
              }}
            >
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot.label}
                  type="button"
                  onClick={() => handleTimeClick(slot)}
                  disabled={slot.disabled}
                  className={`
                    w-full h-10 rounded-xl border text-sm font-medium transition-all
                    ${
                      slot.disabled
                        ? "border-[#e7e2eb] text-[#b4b4be] bg-[#f3f2f8] cursor-default"
                        : "border-[#e7e2eb] text-[#192331] hover:border-[#4c00bd] hover:text-[#4c00bd] cursor-pointer"
                    }
                    ${time === slot.label ? "bg-[#4c00bd] border-[#4c00bd] text-white hover:text-white" : ""}
                  `}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col gap-3 border-t border-[#e7e2eb] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-[#69717d]">
          {!date && "Select a date to see available times."}
          {date && !time && (
            <>
              <strong>{formatLongDate(date)}</strong> – now choose a time.
            </>
          )}
          {date && time && (
            <>
              Your appointment:{" "}
              <strong>
                {formatLongDate(date)} at {time}
              </strong>
            </>
          )}
        </p>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!date || !time || isSaving}
          variant="brand"
          className="h-11 w-full font-medium sm:w-auto sm:px-7"
        >
          {isSaving ? "Saving..." : "Book Appointment"}
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-3 text-right text-sm font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
