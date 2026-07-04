'use client'

export default function ActivityCardSkeleton() {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-48 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />

      {/* Content skeleton */}
      <div className="flex flex-col justify-between flex-1 p-5 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded-md w-3/4" />
        
        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded-md w-full" />
          <div className="h-3 bg-gray-200 rounded-md w-5/6" />
        </div>

        {/* Category & Duration */}
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-gray-200 rounded-md w-16" />
          <div className="h-9 bg-gray-200 rounded-lg w-24" />
        </div>
      </div>
    </div>
  )
}
