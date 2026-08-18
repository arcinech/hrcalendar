"use client"

import { useState } from "react"

import { addDays } from "date-fns"
import { type DateRange } from "react-day-picker"

import { Calendar } from "~/components/ui/calendar"
import { Card, CardContent } from "~/components/ui/card"

export default function LeaveCalendar() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 12),
    to: addDays(new Date(new Date().getFullYear(), 0, 12), 30)
    })

  const bookedDates = Array.from(
    { length: 15 },
    (_, i) => new Date(new Date().getFullYear(), 0, 12 + i)
  )

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <Calendar
        timeZone="Europe/Warsaw"
        mode="range"
        defaultMonth={dateRange?.from}
        selected={dateRange}
        onSelect={setDateRange}
        className="rounded-lg border text-black bg-blue-950"
        captionLayout="dropdown"
        />
    </section>
  )
}