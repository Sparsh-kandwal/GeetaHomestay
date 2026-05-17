import HomeCarousel from "./HomeCarousel";

const LocationComponent = () => {
  return (
    <section className="pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[36px] bg-[#17322e] px-5 py-12 shadow-[0_30px_70px_rgba(23,50,46,0.18)] sm:px-8 lg:px-12">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f1c8af]">
              Explore nearby
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold text-[#fff8ef] sm:text-5xl">
              Scenic spots near your stay
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#d3ddd7] sm:text-base">
              Clear views, quick distance, simple route.
            </p>
          </div>

          <div className="flex justify-center">
            <HomeCarousel />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationComponent;
