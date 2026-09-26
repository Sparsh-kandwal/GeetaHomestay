const SkeletonRoom = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-[28px] border border-[#ede3d5] bg-white animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[16/11] w-full bg-[#e8ded1]/70" />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          {/* Title & Price */}
          <div className="h-6 w-3/4 rounded-md bg-[#e8ded1]/80" />
          <div className="mt-3 h-7 w-28 rounded-md bg-[#e8ded1]/60" />

          {/* Specs */}
          <div className="mt-4 h-4 w-1/2 rounded bg-[#e8ded1]/50" />

          {/* Description lines */}
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full rounded bg-[#e8ded1]/40" />
            <div className="h-3 w-4/5 rounded bg-[#e8ded1]/40" />
          </div>

          {/* Amenities row */}
          <div className="mt-5 pt-3.5 border-t border-[#f0e7dc] flex gap-2">
            <div className="h-3 w-16 rounded bg-[#e8ded1]/40" />
            <div className="h-3 w-20 rounded bg-[#e8ded1]/40" />
            <div className="h-3 w-16 rounded bg-[#e8ded1]/40" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#f0e7dc] flex items-center justify-between">
          <div className="h-4 w-28 rounded bg-[#e8ded1]/50" />
          <div className="h-4 w-4 rounded-full bg-[#e8ded1]/50" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonRoom;

