'use client'

import { Calendar } from 'lucide-react'
import { DateRange, CustomDateRange } from '@/types'

interface DateRangeFilterProps {
  dateRange: DateRange
  customRange: CustomDateRange | null
  onDateRangeChange: (range: DateRange) => void
  onCustomRangeChange: (range: CustomDateRange) => void
}

export default function DateRangeFilter({ 
  dateRange, 
  customRange, 
  onDateRangeChange, 
  onCustomRangeChange 
}: DateRangeFilterProps) {
  
  const handleStartDateChange = (startDate: string) => {
    onCustomRangeChange({
      startDate,
      endDate: customRange?.endDate || startDate
    })
  }

  const handleEndDateChange = (endDate: string) => {
    onCustomRangeChange({
      startDate: customRange?.startDate || endDate,
      endDate
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
        >
          <option value="all">All Time</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {dateRange === 'custom' && (
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={customRange?.startDate || ''}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customRange?.endDate || ''}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
          />
        </div>
      )}
    </div>
  )
}
