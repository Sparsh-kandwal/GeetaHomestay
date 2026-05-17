import { useState, useEffect } from "react";
import TestimonialCard from "./TestimonialCard";
import LoadingCard from "./LoadingCard";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedTestimonials = sessionStorage.getItem("testimonials");

    if (storedTestimonials) {
      setTestimonials(JSON.parse(storedTestimonials));
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL}/testimonials`)
      .then((response) => response.json())
      .then((data) => {
        setTestimonials(data);
        sessionStorage.setItem("testimonials", JSON.stringify(data));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching testimonials:", error);
        setLoading(false);
      });
  }, []);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!testimonials.length) return undefined;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (loading) {
    return <LoadingCard />;
  }

  if (!testimonials.length) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8b4e31]">
            Guest stories
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#17322e] sm:text-4xl">
            Reviews that build confidence before guests book
          </h2>
        </div>

        <div className="mt-12 rounded-[36px] border border-[#e7dfd2] bg-[linear-gradient(180deg,#fffdf9_0%,#f7efe3_100%)] p-5 shadow-[0_22px_60px_rgba(23,50,46,0.08)] sm:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[0.35fr_1fr]">
            <div>
              <p className="text-4xl font-semibold text-[#17322e] sm:text-5xl">4.9</p>
              <p className="mt-2 text-sm font-medium text-[#6f746d]">Guest satisfaction from recent stays</p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={goToPrevious}
                  className="rounded-full bg-[#17322e] p-3 text-white transition hover:bg-[#254842]"
                  aria-label="Previous testimonial"
                >
                  ←
                </button>
                <button
                  onClick={goToNext}
                  className="rounded-full bg-[#17322e] p-3 text-white transition hover:bg-[#254842]"
                  aria-label="Next testimonial"
                >
                  →
                </button>
              </div>
            </div>

            <div>
              <TestimonialCard
                username={testimonials[currentIndex]?.username}
                testimonial={testimonials[currentIndex]?.testimonial}
                rating={testimonials[currentIndex]?.rating}
                image={testimonials[currentIndex]?.image}
              />

              <div className="mt-5 flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2.5 rounded-full transition ${
                      currentIndex === index ? "w-8 bg-[#1f5b52]" : "w-2.5 bg-[#cfc4b3]"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
