import React, { useEffect, useState } from 'react';
import { AboutSection } from '../components/AboutSection';
import Testimonials from '../components/Testimonials';
import Facilities from '../components/Facilities';
import { MapPin, Calendar } from "lucide-react";
import { Link } from 'react-router-dom';
import ScrollPrompt from '../components/ScrollPrompt';
import LocationComponent from '../components/LocationComponent';

const HomePage = () => {
  useEffect(() => {
    const handleScroll = () => {
      const value = window.scrollY;

      // Adjust parallax speed for different screen sizes
      const parallaxSpeed = window.innerHeight > 768 ? 1.1 : 0.8;

      // Apply parallax effects
      document.querySelector('.title').style.marginTop = `${value * parallaxSpeed}px`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [showScrollPrompt, setShowScrollPrompt] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollPrompt(false);  // Hide the prompt after scroll
      } else {
        setShowScrollPrompt(true);  // Show the prompt when scrolled back to top
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      <section
        className="h-screen bg-gradient-to-t from-blue-200 to-blue-400 relative overflow-hidden"
        style={{
          backgroundImage: 'url(static/mount1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
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
                  window.open("https://maps.app.goo.gl/tr8YhF4AuSyNbhWh9", "_blank")
                }
                className="bg-white text-blue-600 px-6 py-2 rounded-md border border-blue-600 hover:bg-blue-50 transition duration-300 flex items-center"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Locate Us
              </button>
              <Link
                to="/rooms"
                className="bg-white text-green-600 px-6 py-2 rounded-md border border-green-600 hover:bg-green-50 transition duration-300 flex items-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showScrollPrompt && <ScrollPrompt />}

      <LocationComponent />
      

      <Facilities />

      <Testimonials />
    </div>
  );
};

export default HomePage;
