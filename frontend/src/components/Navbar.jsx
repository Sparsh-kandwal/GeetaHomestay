import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./api";
import { UserContext } from "../auth/Userprovider";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const logoutMenuRef = useRef(null);
  const location = useLocation();

  const navItems = ["Home", "Rooms","Cart"];
  const { user, isLoading, setUser, setIsLoading } = useContext(UserContext);

  const responseGoogle = async (authResult) => {
    try {
        console.log("Auth result received:", authResult);
        if (authResult.code) {
            const result = await googleAuth(authResult.code);
            console.log("Backend response:", result);
            if (result.data?.user) {
                setUser(result.data.user);
            } else {
                console.error("User data missing in backend response");
                alert("Error while processing login.");
            }
        } else {
            console.error("No authorization code in auth result:", authResult);
            alert("Google Login failed. Please try again.");
        }
    } catch (error) {
        console.error("Error during Google Login:", error);
        alert("Error while Google Login...");
    }
};

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
    scope: "openid profile email",
  });

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
    setShowLogoutMenu(false);
    setIsLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        alert("Logged out successfully!");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  return (
    <header
      className={`flex justify-between items-center h-[65px]  px-8 fixed top-0 w-full z-50 transition-all duration-300 ${
        isHomePage ? "" : "bg-indigo-700 shadow-lg"
      }`}
    >
      {/* Logo */}
      <h1 className="text-3xl text-white">
        <Link to="/home">
          <img src="/static/logo.png" alt="Logo" className="mt-2 h-20 scale-150" />
        </Link>
      </h1>

      {/* Hamburger Menu */}
      <button
        className="block md:hidden text-white text-3xl"
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        ☰
      </button>

      {/* Navigation Menu */}
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
        <ul className="flex flex-col gap-6 md:flex-row md:gap-6 items-center">
        {navItems.map((item) => (
          <li key={item}>
            <Link
              to={`/${item.toLowerCase()}`}
              className="text-lg font-semibold text-white hover:bg-indigo-600 px-4 py-2 rounded-full transition duration-300"
            >
              {item}
            </Link>
          </li>
        ))}
        
        {/* Add the user login/logout button as another list item */}
        <li>
          {isLoading ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : user ? (
            // Display user's profile image
            <div className="relative" ref={logoutMenuRef}>
              <img
                src={user.photo}
                alt="User Avatar"
                className="w-8 h-8 rounded-full cursor-pointer"
                onClick={() => setShowLogoutMenu((prev) => !prev)}
              />
              {showLogoutMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Show login button if not logged in
            <button
              onClick={googleLogin}
              className="bg-white text-indigo-700 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:bg-indigo-600 hover:text-white flex items-center justify-center"
            >
              Login
            </button>
          )}
        </li>
      </ul>


      </nav>
    </header>
  );
};

export default Navbar;
