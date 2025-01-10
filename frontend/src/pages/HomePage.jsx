import React, { useEffect } from 'react';
import { AboutSection } from '../components/AboutSection';
import Testimonials from '../components/Testimonials';
import Facilities from '../components/Facilities';
import { MapPin, Calendar } from "lucide-react";
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

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
        <img src="static/mount1.png" alt="Mountain 1" className="mount1 absolute bottom-0 w-full pointer-events-none" />
        <img src="static/bush2.png" alt="Bush 2" className="bush2 absolute bottom-0 w-full pointer-events-none" />
        <div className="title absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white font-extrabold drop-shadow-md">
        <div className="flex flex-col items-center gap-6">

      {/* Title */}
      <span className="text-5xl md:text-7xl lg:text-9xl text-center">
        Geeta HomeStay
      </span>
      
      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() =>
            window.open("https://maps.app.goo.gl/HBiUXg1QDpgUy2F2A", "_blank")
          }
          className="bg-white text-blue-600 px-6 py-2 rounded-md border border-blue-600 hover:bg-blue-50 transition duration-300 flex items-center"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Locate Us
        </button>
        <Link
          to="/bookings"
          className="bg-white text-green-600 px-6 py-2 rounded-md border border-green-600 hover:bg-green-50 transition duration-300 flex items-center"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book Now
        </Link>
      </div>
    </div>
        </div>
        <img src="static/bush1.png" alt="Bush 1" className="bush1 absolute bottom-0 w-full pointer-events-none" />
        <img src="static/leaf2.png" alt="Leaf 2" className="leaf2 absolute bottom-0 w-full pointer-events-none" />
        <img src="static/leaf1.png" alt="Leaf 1" className="leaf1 absolute bottom-0 w-full pointer-events-none" />
      </section>

      <div className="font-merriweather">
        <AboutSection id="about" />
      </div>

      <Facilities />

      <Testimonials />
    </div>
  );
};

export default HomePage;
