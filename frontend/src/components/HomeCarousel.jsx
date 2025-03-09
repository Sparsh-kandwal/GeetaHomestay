import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MapPin } from "lucide-react";
import { carouselItems } from "../constants/PopularSites";

const HomeCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
    setIsLoading(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
    );
    setIsLoading(true);
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
    <div className="relative w-[80vh] md:w-[800px] h-96 md:h-[500px] overflow-hidden rounded-lg shadow-lg">
      {/* Image with fade-in effect */}
      <div className="absolute inset-0 bg-black/10 animate-fade-in">
        {isLoading && <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>}
        <img
          src={currentItem.image}
          alt={`${currentItem.title} Image`}
          className={`w-full h-full object-cover transition-opacity duration-700 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          loading="lazy"
        />
      </div>

      {/* Navigation buttons */}
      {carouselItems.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-2 md:left-5 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-4 rounded-full hover:bg-opacity-75 transition z-10"
            aria-label="Previous Image"
          >
            <FaChevronLeft size={24} />
          </button>
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-2 md:right-5 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-4 rounded-full hover:bg-opacity-75 transition z-10"
            aria-label="Next Image"
          >
            <FaChevronRight size={24} />
          </button>
        </>
      )}

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center bg-black/50 p-6">
        <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold">
          {currentItem.title}
        </h1>
        <p className="text-white opacity-80 mt-3 md:text-lg">
          Distance from HomeStay: {currentItem.description}
        </p>
        <p className="text-white opacity-70 mt-2 md:text-base">
          {currentItem.extraDescription}
        </p>

        {/* Locate Button */}
        <button
          onClick={() => openGoogleMaps(currentItem.location)}
          className="mt-5 bg-white text-blue-600 px-6 py-2 rounded-md border border-blue-600 hover:bg-blue-50 transition duration-300 flex items-center"
        >
          <MapPin className="w-5 h-5 mr-2" />
          Locate The Place
        </button>
      </div>
    </div>
  );
};

export default HomeCarousel;
