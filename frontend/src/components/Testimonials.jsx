import React, { useState, useEffect } from 'react';
import TestimonialCard from './TestimonialCard';
import { testimonials } from '../constants/Testimonials';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Go to the next testimonial
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  // Go to the previous testimonial
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  // Go to a specific testimonial by index (from dots)
  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  // Automatically scroll to the next testimonial every 5 seconds
  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="bg-[#f5f5f5] py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#3a328c] mb-10">What Our Customers Say</h2>
        
        {/* Carousel container */}
        <div className="flex justify-center items-center space-x-6">
          {/* Previous button */}
          <button
            onClick={goToPrevious}
            className="text-white bg-[#3a328c] p-3 rounded-full hover:bg-[#4d65b4] focus:outline-none focus:ring-2 focus:ring-[#3a328c]"
          >
            &lt;
          </button>

          {/* Testimonial card */}
          <TestimonialCard
            username={testimonials[currentIndex].username}
            testimonial={testimonials[currentIndex].testimonial}
            rating={testimonials[currentIndex].rating}
            image={testimonials[currentIndex].image || 'https://via.placeholder.com/64'}  // Fallback image
          />

          {/* Next button */}
          <button
            onClick={goToNext}
            className="text-white bg-[#3a328c] p-3 rounded-full hover:bg-[#4d65b4] focus:outline-none focus:ring-2 focus:ring-[#3a328c]"
          >
            &gt;
          </button>
        </div>

        {/* Dots navigation */}
        <div className="flex justify-center mt-4">
          {testimonials.map((_, index) => (
            <span
              key={index}
              className={`w-3 h-3 mx-2 rounded-full cursor-pointer ${currentIndex === index ? 'bg-[#3a328c]' : 'bg-gray-400'}`}
              onClick={() => goToTestimonial(index)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
