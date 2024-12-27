import React from 'react';

const Navbar = () => {
  return (
    <div
      className="h-[500px] bg-cover bg-center"
      style={{ backgroundImage: "url('https://via.placeholder.com/1920x1080')" }} 
    >
      {/* Navbar */}
      <div className="h-[70px] flex items-center justify-between px-6 bg-opacity-75 bg-gray-800 text-white">
        {/* Brand */}
        <div className="text-xl font-bold">MyBrand</div>

        {/* Links */}
        <div className="hidden md:flex space-x-6">
          <a href="#home" className="hover:text-gray-300">Home</a>
          <a href="#about" className="hover:text-gray-300">About</a>
          <a href="#services" className="hover:text-gray-300">Services</a>
          <a href="#contact" className="hover:text-gray-300">Contact</a>
        </div>

        {/* Mobile Menu Button */}
        <button className="block md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
