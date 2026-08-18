"use client"

import { addDays } from "date-fns"
import { useState } from "react"
import { type DateRange } from "react-day-picker"
import { Calendar } from "~/components/ui/calendar"
// import { Card, CardContent } from "~/components/ui/card"

export default function LeaveRequestPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 12),
    to: addDays(new Date(new Date().getFullYear(), 0, 12), 30)
    })

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