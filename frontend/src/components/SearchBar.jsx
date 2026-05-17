import { useState, useEffect } from "react";
import { CalendarRange, Search, Sparkles } from "lucide-react";
import { useDateContext } from "../contexts/DateContext";

const SearchBar = ({ setAvailableRooms }) => {
  const {
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
  } = useDateContext();

  const [minCheckOutDate, setMinCheckOutDate] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!checkInDate) {
      const today = new Date().toISOString().split("T")[0];
      setCheckInDate(today);
      setMinCheckOutDate(today);
    }
  }, [checkInDate, setCheckInDate]);

  useEffect(() => {
    if (checkInDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setMinCheckOutDate(nextDay.toISOString().split("T")[0]);
    }
  }, [checkInDate]);

  const handleSearch = async () => {
    if (!checkInDate || !checkOutDate) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    setError("");
    setIsSearching(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/checkAvailability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkIn: checkInDate,
          checkOut: checkOutDate,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setAvailableRooms(data.availability);
      } else {
        setError("We couldn’t fetch availability right now. Please try again.");
      }
    } catch (searchError) {
      console.error("Error fetching availability:", searchError);
      setError("There was a connection issue while checking room availability.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="sticky bottom-4 z-40 mt-8 rounded-[30px] border border-[#e3dacd] bg-[rgba(255,252,247,0.96)] p-4 shadow-[0_20px_50px_rgba(23,50,46,0.12)] backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="xl:w-56">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8b4e31]">
            <Sparkles className="h-4 w-4" />
            Check dates
          </div>
          <p className="text-sm leading-6 text-[#6f746d]">
            Find rooms available for your preferred stay dates.
          </p>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
          <label className="rounded-2xl border border-[#e6ddd1] bg-white px-4 py-3">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">
              Check-in
            </span>
            <input
              type="date"
              value={checkInDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-[#17322e] outline-none"
            />
          </label>

          <label className="rounded-2xl border border-[#e6ddd1] bg-white px-4 py-3">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8b4e31]">
              Check-out
            </span>
            <input
              type="date"
              value={checkOutDate}
              min={minCheckOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-[#17322e] outline-none"
            />
          </label>

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f5b52] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#17322e] disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2 xl:col-span-1"
          >
            {isSearching ? (
              <>
                <CalendarRange className="h-4 w-4 animate-pulse" />
                Checking...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Check availability
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-2xl border border-[#efc9be] bg-[#fff1ea] px-4 py-3 text-sm text-[#8b4e31]">
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
