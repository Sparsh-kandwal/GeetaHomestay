import React, { useEffect } from 'react';
import { AboutSection } from '../components/AboutSection';
import Testimonials from '../components/Testimonials';

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
        <h1 className="title absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl flex items-center align-middle text-white font-extrabold drop-shadow-md">
          Geeta HomeStay
        </h1>


        <img src="static/bush1.png" alt="Bush 1" className="bush1 absolute bottom-0 w-full pointer-events-none" />
        <img src="static/leaf2.png" alt="Leaf 2" className="leaf2 absolute bottom-0 w-full pointer-events-none" />
        <img src="static/leaf1.png" alt="Leaf 1" className="leaf1 absolute bottom-0 w-full pointer-events-none" />
      </section>

      <div className="font-merriweather">
        <AboutSection id="about" />
      </div>

      <Testimonials />


    </div>
  );
};

export default HomePage;
