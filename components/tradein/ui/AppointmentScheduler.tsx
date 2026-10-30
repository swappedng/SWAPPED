"use client";

import React, { useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppointmentDetails {
    appointmentType: { value: string; label: string; };
    date: Date | null;
    time: string | null;
}

export interface AppointmentFormData {
    appointmentType: { value: string; label: string; };
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
  const appointmentTypes = [
    { value: 'house_call', label: 'Certified Expert House Call' },
    { value: 'dispatch_pickup', label: 'Dispatch Pickup' },
    { value: 'walk_in', label: 'Walk-in Customer' },
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const { appointmentType, date, time } = formData;

  useEffect(() => {
    const isValid = !!appointmentType && !!date && !!time;
    onValidationChange(isValid);
    if (isValid) {
        onDataChange({ appointmentType, date, time });
    }
  }, [appointmentType, date, time, onValidationChange, onDataChange]);

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
    const selectedType = appointmentTypes.find(type => type.value === value);
    if (selectedType) {
      setFormData({
        ...formData,
        appointmentType: selectedType
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Appointment Type */}
      <div className="space-y-3">
        <label className="text-base font-semibold text-black">
          Appointment Type
        </label>
        <Select value={appointmentType?.value} onValueChange={handleTypeSelect}>
          <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 focus:border-black transition-colors text-base">
            <SelectValue placeholder="Select appointment type" />
          </SelectTrigger>
          <SelectContent>
            {appointmentTypes.map((type) => (
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