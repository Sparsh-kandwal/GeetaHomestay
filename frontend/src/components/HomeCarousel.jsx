import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MapPin } from "lucide-react";
import { carouselItems } from "../constants/PopularSites";
import { buildAssetUrl, getFallbackRoomImage } from "../utils/roomData";

const HomeCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
    setIsLoading(true);
    setImageError(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
    );
    setIsLoading(true);
    setImageError(false);
  };

  useEffect(() => {
    const intervalId = setInterval(nextImage, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const currentItem = carouselItems[currentImageIndex];

  const openGoogleMaps = (location) => {
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?q=${query}`, "_blank");
  };

  return (
    <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
      <div className="relative aspect-[16/11] md:aspect-[16/8] overflow-hidden">
        <div className="absolute inset-0">
          {isLoading && <div className="absolute inset-0 animate-pulse bg-slate-300/40" />}
          <img
            src={imageError ? getFallbackRoomImage() : buildAssetUrl(currentItem.image)}
            alt={currentItem.title}
            className={`h-full w-full object-cover transition-opacity duration-700 ${isLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setImageError(true);
            }}
            loading="lazy"
          />
        </div>

        {carouselItems.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/35 p-3 text-white transition hover:bg-black/55 md:left-5"
              aria-label="Previous Image"
            >
              <FaChevronLeft size={18} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/35 p-3 text-white transition hover:bg-black/55 md:right-5"
              aria-label="Next Image"
            >
              <FaChevronRight size={18} />
            </button>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/10 to-transparent p-5 sm:p-8">
          <div className="flex h-full flex-col justify-end text-white">
            <div className="max-w-md">
              <h3 className="text-3xl font-semibold sm:text-4xl">{currentItem.title}</h3>
              <p className="mt-2 text-sm text-white/85 sm:text-base">
                {currentItem.description.replace("Approximately ", "")} away
              </p>
              <button
                onClick={() => openGoogleMaps(currentItem.location)}
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#fff4ea] px-5 py-3 text-sm font-semibold text-[#17322e] transition hover:bg-white"
              >
                <MapPin className="h-4 w-4" />
                View route
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeCarousel;
