import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./api";
import { UserContext } from "../auth/Userprovider";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true); // To track navbar visibility
  const location = useLocation();
  const navItems = ["Home", "Rooms", "Gallery", "Profile"];
  const { user, isLoading, setUser, setIsLoading } = useContext(UserContext);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const logoutMenuRef = useRef(null);

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult.code);
        setUser(result.data.user);
      } else {
        alert("Error while Google Login...");
        console.log(authResult);
        throw new Error(authResult);
      }
    } catch (e) {
      alert("Error while Google Login...");
      console.log("Error while Google Login...", e);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
    scope: "openid profile email https://www.googleapis.com/auth/user.phonenumbers.read https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.addresses.read",
  });

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoutMenuRef.current && !logoutMenuRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setShowLogoutMenu(false)
    setIsLoading(true); 
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        alert('Logged out successfully!');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header
        className={`flex justify-between items-center h-17 px-8 fixed top-0 w-full z-50 transition-all duration-300 ${
          isNavbarVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        } ${isHomePage ? "" : "bg-indigo-700"}`}
      >
        <h1 className="text-3xl text-white">Logo</h1>

        {/* Loading state or user photo logic */}
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : user ? (
          <div className="relative flex items-center" ref={logoutMenuRef}>
            <img
              src={user.photo}
              alt="User Avatar"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setShowLogoutMenu(!showLogoutMenu)} // Toggle logout menu on click
            />
            {showLogoutMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg z-50">
                <ul className="py-2">
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={googleLogin}
            className="bg-white text-indigo-700 px-4 py-2 rounded-full"
          >
            Sign in with Google
          </button>
        )}

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
