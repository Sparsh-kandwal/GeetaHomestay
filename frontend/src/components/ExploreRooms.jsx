import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ShieldCheck } from "lucide-react";
import RoomCard from "./RoomCard";
import SearchFilter from "./SearchFilter";
import SearchBar from "./SearchBar";
import { RoomContext } from "../auth/Userprovider";
import SkeletonRoom from "./SkeletonRoom";
import BookingFlowIndicator from "./BookingFlowIndicator";
import { normalizeRooms } from "../utils/roomData";

const ExploreRooms = () => {
  const [searchTermInput, setSearchTermInput] = useState("");
  const [selectedAmenitiesInput, setSelectedAmenitiesInput] = useState([]);
  const [maxPriceInput, setMaxPriceInput] = useState(4000);
  const [guestCountInput, setGuestCountInput] = useState("");
  const [availableRooms, setAvailableRooms] = useState({ first: true });
  const [filteredRooms, setFilteredRooms] = useState([]);

  const amenitiesOptions = ["AC", "Non-AC", "Balcony", "Coffee-Kettle"];
  const bedOptions = ["2 Bed", "3 Bed", "4 Bed"];

  const { fetchRooms, roomsLoading, rooms } = useContext(RoomContext);

  useEffect(() => {
    if (!rooms?.length) {
      fetchRooms();
    }
  }, [fetchRooms, rooms]);

  useEffect(() => {
    const sourceRooms = normalizeRooms(rooms);
    const nextRooms = sourceRooms.map((room) => {
      const availability = availableRooms[room.roomType];

      if (!availability) {
        return room;
      }

      return {
        ...room,
        price: availability.price ?? room.price,
        totalRooms: availability.totalRooms ?? room.totalRooms,
        availableRooms: availability.availableRooms,
      };
    });

    const normalizedSearch = searchTermInput.trim().toLowerCase();
    const nextFilteredRooms = nextRooms.filter((room) => {
      if (!availableRooms.first && !room.availableRooms) {
        return false;
      }

      let matchesAmenities = true;
      if (selectedAmenitiesInput.length > 0) {
        const bed2 = room.roomName.trim().toLowerCase().includes("double");
        const bed3 = room.roomName.trim().toLowerCase().includes("triple");
        const bed4 = room.roomName.trim().toLowerCase().includes("four");
        const hasAC = room.amenities.some(
          (a) => a.name.trim().toLowerCase() === "air conditioning"
        );
        const hasBalcony = room.amenities.some(
          (a) =>
            a.name.trim().toLowerCase() === "balcony" ||
            a.name.trim().toLowerCase() === "private balcony"
        );
        const hasCoffeeKettle = room.amenities.some(
          (a) => a.name.trim().toLowerCase() === "hot-water/coffee kettle"
        );

        if (selectedAmenitiesInput.includes("Balcony")) matchesAmenities &&= hasBalcony;
        if (selectedAmenitiesInput.includes("Coffee-Kettle")) matchesAmenities &&= hasCoffeeKettle;

        const filter2bed = selectedAmenitiesInput.includes("2 Bed");
        const filter3bed = selectedAmenitiesInput.includes("3 Bed");
        const filter4bed = selectedAmenitiesInput.includes("4 Bed");

        if (filter2bed || filter3bed || filter4bed) {
          matchesAmenities &&=
            (filter2bed && bed2) || (filter3bed && bed3) || (filter4bed && bed4);
        }

        const filterAC = selectedAmenitiesInput.includes("AC");
        const filterNonAC = selectedAmenitiesInput.includes("Non-AC");

        if (filterAC && filterNonAC) {
          matchesAmenities &&= true;
        } else if (filterAC) {
          matchesAmenities &&= hasAC;
        } else if (filterNonAC) {
          matchesAmenities &&= !hasAC;
        }
      }

      const matchesPrice = room.price <= Number(maxPriceInput);
      const matchesGuests = guestCountInput
        ? room.maxAdults >= Number(guestCountInput)
        : true;
      const matchesSearch =
        !normalizedSearch ||
        room.roomName.toLowerCase().includes(normalizedSearch) ||
        room.description.toLowerCase().includes(normalizedSearch);

      return matchesAmenities && matchesPrice && matchesGuests && matchesSearch;
    });

    setFilteredRooms(nextFilteredRooms);
  }, [rooms, availableRooms, selectedAmenitiesInput, maxPriceInput, guestCountInput, searchTermInput]);

  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount =
    (selectedAmenitiesInput.length > 0 ? selectedAmenitiesInput.length : 0) +
    (guestCountInput ? 1 : 0) +
    (maxPriceInput < 4000 ? 1 : 0) +
    (searchTermInput ? 1 : 0);

  return (
    <div className="min-h-screen w-full px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Boutique Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e8dfd3] pb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-px w-6 bg-[#8b4e31]" />
              <span className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8b4e31]">
                Karnaprayag • Garhwal Himalayas
              </span>
            </div>
            <p className="mt-2 font-grand text-3xl sm:text-4xl text-[#8b4e31]">
              Sanctuary in the Hills
            </p>
            <h1 className="mt-1 font-merriweather text-3xl font-semibold tracking-tight text-[#17322e] sm:text-4xl lg:text-5xl">
              Our Rooms & Suites
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base font-light leading-relaxed text-[#596661]">
              Each room at Geeta Homestay is individually furnished with clean mountain linens,
              modern private bathrooms, reliable hot water, and quiet balconies overlooking the Alaknanda valley.
            </p>
          </div>

          <div className="shrink-0">
            <BookingFlowIndicator currentStep={1} compact />
          </div>
        </header>

        {/* Date Search Bar */}
        <div className="mb-8">
          <SearchBar setAvailableRooms={setAvailableRooms} />
        </div>

        {/* Refinement Controls & Live Availability Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8dfd3] pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-merriweather text-lg sm:text-xl font-semibold text-[#17322e]">
              {roomsLoading
                ? "Checking available rooms..."
                : `${filteredRooms.length} ${filteredRooms.length === 1 ? "Room" : "Rooms"} Available`}
            </h2>
            {!availableRooms.first && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5f2] px-3 py-1 text-xs font-medium text-[#1f5b52]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Live dates applied
              </span>
            )}
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-[#dcd3c5] bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#17322e] transition hover:border-[#17322e] hover:bg-[#faf6f0]"
          >
            <Compass className="h-3.5 w-3.5 text-[#8b4e31]" />
            <span>{showFilters ? "Hide Filters" : "Filter Rooms"}</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8b4e31] text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Filter Console */}
        {showFilters && (
          <div className="mb-10 rounded-[28px] border border-[#e8ded1] bg-white p-6 shadow-[0_12px_32px_rgba(23,50,46,0.05)]">
            <SearchFilter
              bedOptions={bedOptions}
              searchTermInput={searchTermInput}
              selectedAmenitiesInput={selectedAmenitiesInput}
              maxPriceInput={maxPriceInput}
              guestCountInput={guestCountInput}
              amenitiesOptions={amenitiesOptions}
              setSearchTermInput={setSearchTermInput}
              setSelectedAmenitiesInput={setSelectedAmenitiesInput}
              setMaxPriceInput={setMaxPriceInput}
              setGuestCountInput={setGuestCountInput}
            />
          </div>
        )}

        {/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8 items-stretch">
          <AnimatePresence>
            {roomsLoading ? (
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <SkeletonRoom />
                  </motion.div>
                ))
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room, index) => (
                <motion.div
                  key={room.roomType}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full"
                >
                  <RoomCard room={room} isFeatured={index === 0} />
                </motion.div>
              ))
            ) : (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full rounded-[28px] border border-dashed border-[#dcd3c5] bg-[#fffdfa] p-12 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7efe3]">
                  <Compass className="h-6 w-6 text-[#8b4e31]" />
                </div>
                <h3 className="mt-4 font-merriweather text-xl font-semibold text-[#17322e]">
                  No matching rooms found
                </h3>
                <p className="mt-2 text-sm text-[#6f746d]">
                  Please try adjusting your dates, budget, or amenity preferences.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ExploreRooms;
