import React from 'react';
import { ABOUT_SECTION_CONTENT } from '../constants/About';

export const AboutSection = () => {
  const { title, paragraphs } = ABOUT_SECTION_CONTENT;

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#3a328c] px-4">
      <section className="bg-[#4d65b4] text-white py-8 px-6 sm:py-10 sm:px-12 md:py-12 md:px-16 lg:py-16 lg:px-20 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl transform transition-transform duration-300 hover:scale-105 active:scale-110">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center">
          {title}
        </h1>
        {paragraphs.map((text, index) => (
          <p
            key={index}
            className="mb-4 text-sm sm:text-base md:text-lg leading-relaxed"
          >
            {text}
          </p>
        ))}
      </section>
    </div>
  );
};
