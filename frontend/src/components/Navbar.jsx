import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true); // To track navbar visibility
  const location = useLocation();
  const navItems = ["Home", "Rooms", "Gallery", "Profile"];

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setIsNavbarVisible(false); // Hide navbar after scrolling past the height of the screen
      } else {
        setIsNavbarVisible(true); // Show navbar when back within the screen height
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Determine if the current page is Home
  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  return (
    <div>
      <header
        className={`flex justify-between items-center h-24 px-8 fixed top-0 w-full z-50 transition-all duration-300 ${
          isNavbarVisible
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        } ${isHomePage ? "backdrop-blur-md" : "bg-indigo-700"}`}
      >
        <h1 className="text-3xl text-white">Logo</h1>
        {/* Hamburger menu for mobile */}
        <button
          className="block md:hidden text-white text-3xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
        {/* Navigation menu */}
        <nav
          className={`fixed top-0 right-0 h-full bg-indigo-700 p-8 transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          } md:static md:flex md:bg-transparent md:h-auto md:translate-x-0`}
        >
          <button
            className="block md:hidden text-white text-2xl mb-6"
            onClick={() => setIsMenuOpen(false)}
          >
            ✕
          </button>
          <ul className="flex flex-col gap-6 md:flex-row md:gap-6">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={`/${item.toLowerCase()}`}
                  className="text-lg font-semibold text-white hover:bg-indigo-600 px-4 py-2 rounded-full transition duration-300"
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
