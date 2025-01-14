import React from "react";
import HomeCarousel from "./HomeCarousel";

const LocationComponent = () => {
  return (
    <div className="h-4/5 bg-[#3a328c] py-10 px-4">
      {/* Title Section */}
      <div className="mt-5 mb-10">
        <h1 className="text-5xl md:text-7xl text-center font-extrabold text-gray-100 tracking-wide leading-tight">
          Explore Popular Nearby Places
        </h1>
        <p className="mt-3 text-lg text-center text-gray-300">
          Discover stunning destinations just around the corner.
        </p>
      </div>

      {/* Carousel */}
      <div className="flex justify-center items-center ">
        <HomeCarousel />

      </div>
    </div>
  );
};

export default LocationComponent;
