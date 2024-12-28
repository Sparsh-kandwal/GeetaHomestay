import React, { useEffect } from 'react';
import { AboutSection } from '../components/AboutSection';
import Testimonials from '../components/Testimonials';
import { Card, Button } from '@mui/material'; // Ensure you are using Material UI or your own components

const HomePage = () => {
  useEffect(() => {
    const handleScroll = () => {
      const value = window.scrollY;

      document.querySelector('.title').style.marginTop = `${value * 1.1}px`;
      document.querySelector('.leaf1').style.marginLeft = `${-value}px`;
      document.querySelector('.leaf2').style.marginLeft = `${value}px`;
      document.querySelector('.bush2').style.marginBottom = `${-value}px`;
      document.querySelector('.mount1').style.marginBottom = `${-value * 1.1}px`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      <section className="h-screen bg-gradient-to-t from-blue-200 to-blue-400 relative overflow-hidden">
        <img
          src="/static/mount1.png"
          alt="Mountain 1"
          className="mount1 absolute bottom-0 w-full pointer-events-none"
        />
        <img
          src="/static/bush2.png"
          alt="Bush 2"
          className="bush2 absolute bottom-0 w-full pointer-events-none"
        />
        <h1 className="title absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white font-extrabold drop-shadow-md">
          <span className="text-5xl md:text-7xl lg:text-9xl">Geeta HomeStay</span>
        </h1>
        <img
          src="/static/bush1.png"
          alt="Bush 1"
          className="bush1 absolute bottom-0 w-full pointer-events-none"
        />
        <img
          src="/static/leaf2.png"
          alt="Leaf 2"
          className="leaf2 absolute bottom-0 w-full pointer-events-none"
        />
        <img
          src="/static/leaf1.png"
          alt="Leaf 1"
          className="leaf1 absolute bottom-0 w-full pointer-events-none"
        />
      </section>

      {/* Card Component */}
      <div className="relative">
        <div className="flex items-center   absolute top-1/2 left-1/3 bg-white rounded-full shadow-md p-4">
          <div className="flex flex-col items-center mx-4 text-gray-500">
            <strong className="text-gray-800">GeetaHomeStay-KarnPrayag</strong>
           
          </div>
          <div className="flex flex-col items-center mx-4 text-gray-500">
            <strong className="text-gray-800">Check in</strong>
            <span className="text-sm">Date</span>
          </div>
          <div className="flex flex-col items-center mx-4 text-gray-500">
            <strong className="text-gray-800">Arrival</strong>
            <span className="text-sm">Time</span>
          </div>
          <div className="flex flex-col items-center mx-4 text-gray-500">
            <strong className="text-gray-800">Check Out</strong>
            <span className="text-sm">Date</span>
          </div>
          <div className="flex flex-col items-center mx-4 text-gray-500">
            <strong className="text-gray-800">Guests</strong>
            <span className="text-sm">Add guests</span>
          </div>
          <div className="bg-yellow-400 rounded-full p-2 cursor-pointer hover:bg-yellow-500">
            <img src="https://img.icons8.com/ios-filled/24/000000/search.png" alt="Search Icon" />
          </div>
        </div>
      </div>

      <div className="font-merriweather">
        <AboutSection id="about" />
      </div>

      <Testimonials />
    </div>
  );
};

export default HomePage;
