'use client'

import { Download, RotateCcw } from 'lucide-react'

interface FilterActionsProps {
  onExport: () => void
  onReset: () => void
}

export default function FilterActions({ 
  onExport, 
  onReset 
}: FilterActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex justify-end gap-3">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-300 text-red-600 font-semibold rounded-md hover:bg-red-100 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  )
}
