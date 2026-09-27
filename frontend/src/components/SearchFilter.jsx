import { SlidersHorizontal, RotateCcw, X, Search, Users, Check } from "lucide-react";

const SearchFilter = ({
  bedOptions,
  searchTermInput,
  maxPriceInput,
  guestCountInput,
  amenitiesOptions,
  selectedAmenitiesInput,
  setSearchTermInput,
  setSelectedAmenitiesInput,
  setMaxPriceInput,
  setGuestCountInput,
  onReset,
  onClose,
  activeFilterCount = 0,
  totalResults,
}) => {
  const toggleAmenity = (amenity) => {
    setSelectedAmenitiesInput((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="w-full rounded-[28px] border border-[#e8ded1] bg-white p-5 sm:p-7 shadow-[0_12px_32px_rgba(23,50,46,0.05)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#f0e7dc]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7efe3] text-[#8b4e31]">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-merriweather text-base sm:text-lg font-semibold text-[#17322e]">
              Refine Your Stay
            </h3>
            {activeFilterCount > 0 ? (
              <p className="text-xs text-[#8b4e31] font-medium">
                {activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}
              </p>
            ) : (
              <p className="text-xs text-[#8f8679]">
                Filter by vibe, bed type, amenities, or price
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#8b4e31] hover:bg-[#fff5f0] transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset all</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd3c5] bg-[#faf7f2] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#17322e] transition hover:border-[#17322e] hover:bg-white active:scale-95"
            aria-label="Hide filters"
          >
            <X className="h-3.5 w-3.5" />
            <span>Hide</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Search Room */}
        <div className="lg:col-span-4">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b4e31]">
            Search Room
          </label>
          <div className="relative mt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8f8679]" />
            <input
              type="text"
              value={searchTermInput}
              onChange={(e) => setSearchTermInput(e.target.value)}
              placeholder="Search by room name or vibe..."
              className="w-full rounded-2xl border border-[#e3dacd] bg-[#fffdf9] pl-10 pr-4 py-2.5 text-sm text-[#17322e] outline-none transition placeholder:text-[#a09a8e] focus:border-[#1f5b52] focus:ring-1 focus:ring-[#1f5b52]"
            />
          </div>
        </div>

        {/* Total Guests */}
        <div className="lg:col-span-3">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b4e31]">
            Total Guests
          </label>
          <div className="relative mt-2">
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8f8679]" />
            <select
              value={guestCountInput}
              onChange={(e) => setGuestCountInput(e.target.value)}
              className="w-full rounded-2xl border border-[#e3dacd] bg-[#fffdf9] pl-10 pr-8 py-2.5 text-sm text-[#17322e] outline-none transition focus:border-[#1f5b52] focus:ring-1 focus:ring-[#1f5b52] cursor-pointer appearance-none"
            >
              <option value="">Any number of guests</option>
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5 Guests</option>
              <option value="6">6 Guests</option>
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8f8679]">
              ▼
            </span>
          </div>
        </div>

        {/* Price Slider */}
        <div className="lg:col-span-5">
          <div className="flex items-center justify-between">
            <label htmlFor="maxPrice" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b4e31]">
              Max Price Per Night
            </label>
            <span className="font-merriweather text-sm font-bold text-[#17322e]">
              ₹{Number(maxPriceInput).toLocaleString("en-IN")}
            </span>
          </div>
          <input
            type="range"
            id="maxPrice"
            min="1200"
            max="4000"
            step="100"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="mt-3 w-full accent-[#1f5b52] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#8f8679] mt-1">
            <span>₹1,200</span>
            <span>₹4,000</span>
          </div>
        </div>

        {/* Bed Type */}
        <div className="lg:col-span-6">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b4e31]">
            Bed Configuration
          </label>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {bedOptions.map((beds) => {
              const isSelected = selectedAmenitiesInput.includes(beds);
              return (
                <button
                  key={beds}
                  type="button"
                  onClick={() => toggleAmenity(beds)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition active:scale-95 ${
                    isSelected
                      ? "border border-[#1f5b52] bg-[#1f5b52] text-white shadow-sm"
                      : "border border-[#e3dacd] bg-[#fffdf9] text-[#5e635d] hover:border-[#1f5b52] hover:bg-[#eef5f2]"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  {beds}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amenities */}
        <div className="lg:col-span-6">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b4e31]">
            Room Amenities
          </label>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {amenitiesOptions.map((amenity) => {
              const isSelected = selectedAmenitiesInput.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition active:scale-95 ${
                    isSelected
                      ? "border border-[#8b4e31] bg-[#8b4e31] text-white shadow-sm"
                      : "border border-[#e3dacd] bg-[#fffdf9] text-[#5e635d] hover:border-[#8b4e31] hover:bg-[#fff5f0]"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile-Only Bottom Actions */}
      <div className="mt-6 flex sm:hidden items-center justify-between gap-3 border-t border-[#f0e7dc] pt-4">
        <button
          type="button"
          onClick={onReset}
          disabled={activeFilterCount === 0}
          className="flex-1 rounded-xl border border-[#e3dacd] bg-[#fffdf9] px-4 py-2.5 text-xs font-semibold text-[#8b4e31] transition hover:bg-[#fff5f0] disabled:opacity-40"
        >
          Reset All
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl bg-[#1f5b52] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#17322e] active:scale-95"
        >
          {totalResults !== undefined ? `Show ${totalResults} Rooms` : "Close"}
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
