import React from 'react';
import { ABOUT_SECTION_CONTENT } from '../constants/About';

export const AboutSection = () => {
  const { title, paragraphs } = ABOUT_SECTION_CONTENT;

    


  return (
    <>
    <div className="flex justify-center items-center h-screen bg-[#3a328c]">
      <section className="bg-[#4d65b4] text-white py-12 px-8 rounded-lg shadow-lg max-w-3xl transform transition-transform duration-300 hover:scale-105 active:scale-110">
        <h1 className="text-4xl font-bold mb-6 text-center">{title}</h1>
        {paragraphs.map((text, index) => (
          <p key={index} className="mb-4 text-lg">
            {text}
          </p>
        ))}
      </section>
      
    </div>
    
  </>
  );
};
