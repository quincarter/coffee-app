import React, { useState, useEffect } from "react";

type TimeInputProps = {
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  onChange: (hours: string, minutes: string, seconds: string) => void;
  isSmall?: boolean;
};

export default function TimeInput({
  initialHours = 0,
  initialMinutes = 0,
  initialSeconds = 0,
  onChange,
  isSmall = false,
}: TimeInputProps) {
  const [hoursStr, setHoursStr] = useState(initialHours.toString().padStart(2, "0"));
  const [minutesStr, setMinutesStr] = useState(initialMinutes.toString().padStart(2, "0"));
  const [secondsStr, setSecondsStr] = useState(initialSeconds.toString().padStart(2, "0"));

  useEffect(() => {
    setHoursStr(initialHours.toString().padStart(2, "0"));
    setMinutesStr(initialMinutes.toString().padStart(2, "0"));
    setSecondsStr(initialSeconds.toString().padStart(2, "0"));
  }, [initialHours, initialMinutes, initialSeconds]);

  const validateTimeInput = (value: string, max: number): string => {
    // Allow empty string or numbers only
    if (value === "" || /^\d+$/.test(value)) {
      // If it's a number, ensure it's within range
      if (value !== "" && parseInt(value) > max) {
        return max.toString();
      }
      return value;
    }
    // If invalid input, return previous valid value
    return value.replace(/[^\d]/g, "");
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = validateTimeInput(e.target.value, 23);
    setHoursStr(newValue);
    onChange(newValue, minutesStr, secondsStr);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = validateTimeInput(e.target.value, 59);
    setMinutesStr(newValue);
    onChange(hoursStr, newValue, secondsStr);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = validateTimeInput(e.target.value, 59);
    setSecondsStr(newValue);
    onChange(hoursStr, minutesStr, newValue);
  };

  return (
    <div className="flex space-x-2">
      <div>
        <input
          type="text"
          id="hours"
          value={hoursStr}
          onChange={handleHoursChange}
          className={
            isSmall
              ? "input input-bordered input-sm w-full"
              : "input input-bordered w-full"
          }
          placeholder="HH"
          maxLength={2}
        />
        <span className="text-xs text-center block mt-1">Hours</span>
      </div>
      <div>
        <input
          type="text"
          id="minutes"
          value={minutesStr}
          onChange={handleMinutesChange}
          className={
            isSmall
              ? "input input-bordered input-sm w-full"
              : "input input-bordered w-full"
          }
          placeholder="MM"
          maxLength={2}
        />
        <span className="text-xs text-center block mt-1">Minutes</span>
      </div>
      <div>
        <input
          type="text"
          id="seconds"
          value={secondsStr}
          onChange={handleSecondsChange}
          className={
            isSmall
              ? "input input-bordered input-sm w-full"
              : "input input-bordered w-full"
          }
          placeholder="SS"
          maxLength={2}
        />
        <span className="text-xs text-center block mt-1">Seconds</span>
      </div>
    </div>
  );
}