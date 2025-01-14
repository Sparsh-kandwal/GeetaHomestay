// YourMainComponent.js
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { carouselItems } from "../constants/PopularSites";
import { MapPin } from "lucide-react";

const HomeCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      nextImage();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const currentItem = carouselItems[currentImageIndex];

  const openGoogleMaps = (location) => {
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?q=${query}`, "_blank");
  };

  return (
    <div className="relative w-[800px] h-96 md:h-[500px]">
      <img
        src={currentItem.image}
        alt={`${currentItem.title} Image`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {carouselItems.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-0 md:left-5 transform -translate-y-1/2 md:bg-black bg-opacity-50 text-white md:p-4 rounded-full hover:bg-opacity-75 transition z-10"
            aria-label="Previous Image"
          >
            <FaChevronLeft size={24} />
          </button>
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-0 md:right-5 transform -translate-y-1/2 md:bg-black bg-opacity-50 text-white md:p-4 rounded-full hover:bg-opacity-75 transition z-10"
            aria-label="Next Image"
          >
            <FaChevronRight size={24} />
          </button>
        </>
      )}

      <div className="absolute inset-0 grid h-full w-full place-items-center bg-black/50">
        <div className="w-3/4 text-center md:w-2/4">
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold">
            {currentItem.title}
          </h1>
          <p className="text-white opacity-80 mt-4">{currentItem.description}</p>
          <p className="text-white opacity-70 mt-2">{currentItem.extraDescription}</p>
        </div>
        <button
          onClick={() => openGoogleMaps(currentItem.location)}
          className="bg-white text-blue-600 px-6 py-2 rounded-md border border-blue-600 hover:bg-blue-50 transition duration-300 flex items-center"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Locate The Place
        </button>
      </div>
    </div>
  );
};

export default HomeCarousel;
