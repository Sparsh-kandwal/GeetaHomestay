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

  return (
    <div className="min-h-screen w-full px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#17322e_0%,#295046_100%)] p-6 text-white shadow-[0_22px_50px_rgba(23,50,46,0.16)] sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              <Compass className="h-4 w-4" />
              Rooms
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold sm:text-5xl">
              Find your stay
            </h1>
          </div>

          <div className="rounded-[28px] border border-[#e7dfd2] bg-[rgba(255,252,247,0.92)] p-5 shadow-[0_16px_40px_rgba(23,50,46,0.06)]">
            <BookingFlowIndicator currentStep={1} compact />
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#eef5f2] px-4 py-2 text-sm text-[#1f5b52]">
              <ShieldCheck className="h-4 w-4" />
              Live availability
            </div>
          </div>
        </div>

        <div className="mt-6">
          <SearchBar setAvailableRooms={setAvailableRooms} />
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
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

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-col gap-3 rounded-[24px] border border-[#e7dfd2] bg-white p-4 shadow-[0_12px_30px_rgba(23,50,46,0.05)] sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold text-[#17322e]">
                {roomsLoading ? "Loading..." : `${filteredRooms.length} room${filteredRooms.length === 1 ? "" : "s"}`}
              </h2>
              <span className="rounded-full bg-[#f7efe3] px-4 py-2 text-sm text-[#6f746d]">
                Simple filters
              </span>
            </div>

            <div className="flex flex-col gap-8">
              <AnimatePresence>
                {roomsLoading ? (
                  Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SkeletonRoom />
                      </motion.div>
                    ))
                ) : filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <motion.div
                      key={room.roomType}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RoomCard room={room} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-[24px] border border-dashed border-[#d9cfbf] bg-[rgba(255,252,247,0.9)] p-8 text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7efe3]">
                      <Compass className="h-6 w-6 text-[#8b4e31]" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-[#17322e]">
                      No rooms found
                    </h3>
                    <p className="mt-2 text-sm text-[#6f746d]">
                      Try different dates or filters.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreRooms;
