"use client";

import React, { useEffect, useState } from 'react';
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getAvailability } from "@/lib/api/endpoints/customer/availability";
import { createTradeInAppointment } from "@/lib/api/endpoints/customer/tradein";
import { AvailabilityBlock } from "@/lib/api/types/tradein";
import { useRouter } from "next/navigation";

export interface AppointmentDetails {
    date: Date | null;
    time: string | null;
}

export interface AppointmentFormData {
    date: Date | null;
    time: string | null;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Default availability: 8 AM - 5 PM WAT (UTC+1), Monday - Friday
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 17;

export function AppointmentScheduler({
    formData,
    setFormData,
    onDataChange,
    onValidationChange,
    swapId,
    onComplete,
    onSavingChange
}: {
    formData: AppointmentFormData;
    setFormData: (data: AppointmentFormData) => void;
    onDataChange: (details: AppointmentDetails) => void;
    onValidationChange: (isValid: boolean) => void;
    swapId: string | null;
    onComplete: () => void;
    onSavingChange: (isSaving: boolean) => void;
}) {
  const router = useRouter();
  const [availabilityBlocks, setAvailabilityBlocks] = useState<AvailabilityBlock[]>([]);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [error, setError] = useState("");
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [appointmentData, setAppointmentData] = useState<AppointmentDetails | null>(null);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const blocks = await getAvailability();
        setAvailabilityBlocks(blocks);
      } catch (error) {
        console.error('Failed to load availability:', error);
        // Continue with empty availability blocks (will use defaults)
        setAvailabilityBlocks([]);
      }
    };
    loadAvailability();
  }, []);

  const { date, time } = formData;

  useEffect(() => {
    const isValid = !!date && !!time;
    onValidationChange(isValid);
    setIsStepValid(isValid);
    if (isValid) {
        onDataChange({ date, time });
    }
  }, [date, time, onValidationChange, onDataChange]);

  const handleNext = async () => {
    if (!swapId) {
      setError(
        "Your swap details are missing. Please start the trade-in again.",
      );
      return;
    }
    if (!appointmentData?.date || !appointmentData.time) return;

    setIsSaving(true);
    onSavingChange(true);
    setError("");
    try {
      // Create the appointment (swapMethod is already set on the swap record)
      await createTradeInAppointment({
        swapId,
        date: appointmentData.date.toISOString(),
        time: appointmentData.time,
      });
      // Clear localStorage state before navigating
      localStorage.removeItem('tradeInFlowState');
      onComplete();
    } catch (error) {
      console.error("Error saving appointment:", error);
      setError("We could not save your appointment. Please try again.");
    } finally {
      setIsSaving(false);
      onSavingChange(false);
    }
  };

  const getBlockForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
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

    const slots: { label: string; hour: number; minute: number; disabled: boolean }[] = [];
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    for (let hour = DEFAULT_START_HOUR; hour <= DEFAULT_END_HOUR; hour++) {
      [0, 30].forEach((minute) => {
        if (hour === DEFAULT_END_HOUR && minute === 30) return;

        // Skip blocked hours if there's an exception block with hour ranges
        if (block && !block.isUnavailable && block.unavailableStartHour !== null && block.unavailableEndHour !== null) {
          if (hour >= block.unavailableStartHour && hour < block.unavailableEndHour) return;
        }

        // Disable past times for today
        const isPast = isToday && (hour < now.getHours() || (hour === now.getHours() && minute < now.getMinutes()));

        const period = hour >= 12 ? 'pm' : 'am';
        const displayHour = hour % 12 || 12;
        const label = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;

        slots.push({ label, hour, minute, disabled: isPast });
      });
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
    setViewMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  };

  const handleTimeClick = (slot: { label: string; disabled: boolean }) => {
    if (slot.disabled) return;
    setFormData({
      ...formData,
      time: slot.label,
    });
  };

  const goToPreviousMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = getDaysInMonth(viewMonth);
  const availableTimeSlots = date ? getTimeSlots(date) : [];
  const selectedDayName = date ? DAYS[(date.getDay() + 6) % 7] : '';

  const formatLongDate = (d: Date) => {
    return `${DAYS[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="w-full sm:w-fit max-w-full mx-auto overflow-hidden rounded-[28px] border border-[#e7e2eb] bg-[#fffdfb] shadow-[0_20px_50px_rgba(25,35,49,0.05)]">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-[#e7e2eb]">
        <div className="w-13 h-13 rounded-full border border-[#e7e2eb] flex items-center justify-center flex-shrink-0">
          <Clock className="w-6 h-6 text-[#69717d]" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-[#192331]">Book an appointment</h1>
          <p className="text-sm text-[#69717d]">Pick a day, then choose a time.</p>
        </div>
      </div>

      {/* Body - Calendar and Time Panel */}
      <div className="flex flex-col sm:flex-row">
        {/* Calendar Section - Fixed width */}
        <div className="flex-none p-6 w-full sm:w-[340px]">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              disabled={viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth()}
              className="w-8 h-8 rounded-lg border border-[#e7e2eb] flex items-center justify-center text-[#69717d] hover:bg-[#f3f2f8] disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-semibold text-[#192331]">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </h2>
            <button
              onClick={goToNextMonth}
              className="w-8 h-8 rounded-lg border border-[#e7e2eb] flex items-center justify-center text-[#69717d] hover:bg-[#f3f2f8]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-xs text-[#69717d] py-2">
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
              const isSelected = date && day.toDateString() === date.toDateString();
              const isToday = day.toDateString() === today.toDateString();
              const isOtherMonth = day.getMonth() !== viewMonth.getMonth();

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  disabled={isUnavailable}
                  className={`
                    aspect-square rounded-full flex items-center justify-center text-sm
                    transition-colors relative
                    ${isUnavailable ? 'text-[#b4b4be] cursor-default' : 'hover:bg-[#f3f2f8] cursor-pointer'}
                    ${isOtherMonth ? 'text-[#b4b4be]' : ''}
                    ${isSelected ? 'bg-[#4c00bd] text-white font-semibold' : ''}
                    ${isToday && !isSelected ? 'after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[#4c00bd]' : ''}
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Panel - slides in from the right on desktop, from below on mobile */}
        <div
          className={`
            flex-none transition-all duration-450 ease-out overflow-hidden
            border-t sm:border-t-0 sm:border-l border-[#e7e2eb]
            ${date ? 'w-full sm:w-[240px] opacity-100 max-h-[500px]' : 'w-full sm:w-0 opacity-0 max-h-0'}
          `}
        >
          <div className="h-full p-6 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-[#192331] mb-1">
              {selectedDayName}, {date?.getDate()} {date ? MONTHS[date.getMonth()].slice(0, 3) : ''}
            </h3>
            <p className="text-xs text-[#69717d] mb-3">8:00 am – 5:00 pm</p>

            <div className=" w-3/4 flex flex-col min-h-0 max-h-[330px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-2 "
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, #000 calc(100% - 28px), transparent)',
                maskImage: 'linear-gradient(to bottom, #000 calc(100% - 28px), transparent)',
              }}
            >
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot.label}
                  onClick={() => handleTimeClick(slot)}
                  disabled={slot.disabled}
                  className={`
                    w-full py-1.5 h-24 rounded-lg border text-sm font-medium transition-all
                    ${slot.disabled
                      ? 'border-[#e7e2eb] text-[#b4b4be] bg-[#f3f2f8] cursor-default'
                      : 'border-[#e7e2eb] text-[#192331] hover:border-[#4c00bd] hover:text-[#4c00bd] cursor-pointer'
                    }
                    ${time === slot.label ? 'bg-[#4c00bd] border-[#4c00bd] text-white hover:text-white' : ''}
                  `}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-t border-[#e7e2eb] min-h-[77px]">
        <p className="text-sm text-[#69717d] max-w-[60%]">
          {!date && 'Select a date to see available times.'}
          {date && !time && <><strong>{formatLongDate(date)}</strong> – now choose a time.</>}
          {date && time && <>Your appointment: <strong>{formatLongDate(date)} at {time}</strong></>}
        </p>
        {date && time && (
          <button
            onClick={handleNext}
            disabled={isSaving}
            className="h-12 px-7 rounded-xl bg-[#4c00bd] text-white font-medium text-sm transition-opacity disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Book Appointment"}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="px-6 pb-5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
