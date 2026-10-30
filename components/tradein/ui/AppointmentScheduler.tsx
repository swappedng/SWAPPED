"use client";

import React, { useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSwapMethodLabel, SwapMethod } from "@/lib/api/types/enums";

export interface AppointmentDetails {
    swapMethod: SwapMethod;
    date: Date | null;
    time: string | null;
}

export interface AppointmentFormData {
    swapMethod: SwapMethod;
    date: Date | null;
    time: string | null;
}

export function AppointmentScheduler({ 
    formData,
    setFormData,
    onDataChange, 
    onValidationChange 
}: { 
    formData: AppointmentFormData;
    setFormData: (data: AppointmentFormData) => void;
    onDataChange: (details: AppointmentDetails) => void; 
    onValidationChange: (isValid: boolean) => void; 
}) {
  const swapMethods = Object.values(SwapMethod).map((value) => ({
    value,
    label: getSwapMethodLabel(value),
  }));

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const { swapMethod, date, time } = formData;

  useEffect(() => {
    const isValid = !!swapMethod && !!date && !!time;
    onValidationChange(isValid);
    if (isValid) {
        onDataChange({ swapMethod, date, time });
    }
  }, [swapMethod, date, time, onValidationChange, onDataChange]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setFormData({
      ...formData,
      date: selectedDate || null
    });
  };

  const handleTimeSelect = (selectedTime: string) => {
    setFormData({
      ...formData,
      time: selectedTime
    });
  };

  const handleTypeSelect = (value: string) => {
    if (Object.values(SwapMethod).includes(value as SwapMethod)) {
      setFormData({
        ...formData,
        swapMethod: value as SwapMethod,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Swap Method */}
      <div className="space-y-3">
        <label className="text-base font-semibold text-black">
          Swap Method
        </label>
        <Select value={swapMethod} onValueChange={handleTypeSelect}>
          <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 focus:border-black transition-colors text-base">
            <SelectValue placeholder="Select swap method" />
          </SelectTrigger>
          <SelectContent>
            {swapMethods.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-base">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Selection */}
      <div className="space-y-3">
        <label className="text-base font-semibold text-black">
          Select Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-12 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 focus:border-black transition-colors justify-start text-left font-normal text-base",
                !date && "text-gray-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Selection */}
      <div className="space-y-3">
        <label className="text-base font-semibold text-black">
          Select Time
        </label>
        <Select value={time || ""} onValueChange={handleTimeSelect}>
          <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 focus:border-black transition-colors text-base">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-gray-500" />
              <SelectValue placeholder="Select time" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((slot) => (
              <SelectItem key={slot} value={slot} className="text-base">
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
