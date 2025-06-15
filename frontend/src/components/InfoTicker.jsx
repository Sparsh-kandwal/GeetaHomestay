import React from "react";

// Announcements array for easy reuse
const announcements = [
  { label: "NEW", text: "For More Details, Call: 9756198989" },
  { label: "NEW", text: "Book Direct on Website – 0% Commission!" },
  { label: "NEW", text: "Special Packages on Family Room (with Balcony)" },
  { label: "NEW", text: "Free 45-Min Morning Yoga for 7+ Day Stays" },
  { label: "NEW", text: "CP & MAP Plans for Large Groups" },
  { label: "NEW", text: "Discounted Rates – Limited Time Offer!" },
];

const InfoTicker = () => {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#232046] via-[#232046] to-[#232046] border-b border-indigo-900 z-40">
      {/* Gradient edges */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#232046] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#232046] to-transparent z-10" />

      {/* Scrolling content */}
      <div className="whitespace-nowrap flex items-center h-10">
        <div className="animate-marquee flex min-w-max">
          {announcements.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center mx-8"
            >
              <span className="bg-red-600 text-xs font-bold px-2 py-1 rounded mr-3 text-white shadow">
                {item.label}
              </span>
              <span className="text-white text-sm md:text-base font-medium">
                {item.text}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {announcements.map((item, idx) => (
            <div
              key={`dup-${idx}`}
              className="flex items-center mx-8"
            >
              <span className="bg-red-600 text-xs font-bold px-2 py-1 rounded mr-3 text-white shadow">
                {item.label}
              </span>
              <span className="text-white text-sm md:text-base font-medium">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoTicker;
