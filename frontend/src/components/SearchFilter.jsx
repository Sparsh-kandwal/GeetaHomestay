import { useEffect, useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

const SearchFilter = ({
  bedOptions,
  searchTermInput,
  maxPriceInput,
  guestCountInput,
  amenitiesOptions,
  setSearchTermInput,
  setSelectedAmenitiesInput,
  setMaxPriceInput,
  setGuestCountInput,
}) => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsFilterVisible(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAmenityChangeInput = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
    setSelectedAmenitiesInput((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleReset = () => {
    setSearchTermInput("");
    setSelectedAmenitiesInput([]);
    setMaxPriceInput(4000);
    setGuestCountInput("");
    setSelectedAmenities([]);
  };

  return (
    <div className="h-fit w-full lg:sticky lg:top-32 lg:w-[320px]">
      <div className="rounded-[28px] border border-[#e5dccf] bg-white p-5 shadow-[0_16px_38px_rgba(23,50,46,0.06)] sm:p-6">
        <button
          onClick={() => setIsFilterVisible((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-2xl bg-[#f7efe3] px-4 py-3 text-left text-sm font-semibold text-[#17322e] transition hover:bg-[#efe4d3] lg:cursor-default"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Refine your stay
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8b4e31]">
            {isFilterVisible ? "Hide" : "Show"}
          </span>
        </button>

        <div className={isFilterVisible ? "mt-6 space-y-7" : "hidden"}>
          <div>
            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">
              Search room
            </label>
            <input
              type="text"
              value={searchTermInput}
              onChange={(e) => setSearchTermInput(e.target.value)}
              placeholder="Search by room name or vibe"
              className="mt-3 w-full rounded-2xl border border-[#e3dacd] bg-[#fffdf9] px-4 py-3 text-sm text-[#17322e] outline-none transition focus:border-[#1f5b52]"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">
              Bed type
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {bedOptions.map((beds) => (
                <label
                  key={beds}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    selectedAmenities.includes(beds)
                      ? "border-[#1f5b52] bg-[#eef5f2] text-[#1f5b52]"
                      : "border-[#e3dacd] bg-[#fffdf9] text-[#5e635d]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(beds)}
                    onChange={() => handleAmenityChangeInput(beds)}
                    className="sr-only"
                  />
                  {beds}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">
              Amenities
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {amenitiesOptions.map((amenity) => (
                <label
                  key={amenity}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    selectedAmenities.includes(amenity)
                      ? "border-[#c97953] bg-[#fff1ea] text-[#8b4e31]"
                      : "border-[#e3dacd] bg-[#fffdf9] text-[#5e635d]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChangeInput(amenity)}
                    className="sr-only"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">
                Price
              </h3>
              <span className="text-sm font-semibold text-[#17322e]">Rs. {maxPriceInput}</span>
            </div>
            <input
              type="range"
              id="maxPrice"
              min="1200"
              max="4000"
              step="100"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="mt-4 w-full accent-[#1f5b52]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">
              Total guests
            </label>
            <select
              value={guestCountInput}
              onChange={(e) => setGuestCountInput(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-[#e3dacd] bg-[#fffdf9] px-4 py-3 text-sm text-[#17322e] outline-none transition focus:border-[#1f5b52]"
            >
              <option value="">Any</option>
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5 Guests</option>
              <option value="6">6 Guests</option>
            </select>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm font-semibold text-[#8b4e31] transition hover:bg-[#fde6db]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
