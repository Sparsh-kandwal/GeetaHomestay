import { useState, useEffect, useContext, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Menu, X, CalendarDays, ShieldCheck } from "lucide-react";
import { googleAuth } from "../auth/api";
import { UserContext } from "../auth/Userprovider";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const logoutMenuRef = useRef(null);
  const location = useLocation();

  const navItems = ["Home", "Rooms", "Cart"];
  const { user, isLoading, setUser, setIsLoading } = useContext(UserContext);

  const responseGoogle = async (authResult) => {
    try {
      if (authResult.code) {
        const result = await googleAuth(authResult.code);
        if (result.data?.user) {
          setUser(result.data.user);
        } else {
          alert("Error while processing login.");
        }
      } else {
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoutMenuRef.current && !logoutMenuRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowConfirmModal(false);
    setShowLogoutMenu(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        alert("Logged out successfully!");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isHomePage = location.pathname === "/" || location.pathname === "/home";
  const headerClasses =
    isHomePage && !isScrolled
      ? "bg-transparent"
      : "border-b border-white/50 bg-[#1f5b52] shadow-[0_18px_40px_rgba(23,50,46,0.08)] backdrop-blur-xl";
  const linkClasses =
    isHomePage && !isScrolled
      ? "text-white hover:bg-white/15"
      : "text-white hover:bg-[#295046]";
  const logoTextClasses = "text-white";
  const badgeClasses =
    isHomePage && !isScrolled
      ? "bg-white/15 text-white"
      : "bg-[#295046] text-white";
  const ctaClasses =
    isHomePage && !isScrolled
      ? "bg-white text-[#17322e] hover:bg-[#f5eee2]"
      : "bg-white text-[#1f5b52] hover:bg-[#f0f0f0]";

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 mx-auto flex h-[74px] w-full items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-10 ${headerClasses}`}
      >
        <Link
          to="/home"
          className={`flex min-w-0 items-center gap-2 sm:gap-3 transition-all duration-300 ${
            isHomePage && !isScrolled ? "flex-1" : ""
          }`}
        >
          <div
            className={`shrink-0 rounded-lg transition-all duration-300 ${
              isHomePage && !isScrolled ? "h-14 sm:h-16" : "h-12 w-12 overflow-hidden sm:h-14 sm:w-14"
            }`}
          >
            <img
              src="/logo.png"
              alt="Geeta Homestay logo"
              className={`object-contain shadow-md transition-all duration-300 ${
                isHomePage && !isScrolled ? "h-full" : "h-full w-full"
              }`}
            />
          </div>
          <div className={`min-w-0 ${logoTextClasses}`}>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] opacity-80 sm:text-xs sm:tracking-[0.35em]">
              Geeta Homestay
            </p>
            <p
              className={`truncate font-medium opacity-90 ${
                isHomePage && !isScrolled ? "hidden text-sm sm:block sm:text-base" : "hidden text-sm sm:block"
              }`}
            >
              Book a calm mountain stay
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 lg:flex">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${badgeClasses}`}>
            <ShieldCheck className="h-4 w-4" />
            Secure bookings
          </div>
          <Link
            to="/rooms"
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${ctaClasses}`}
          >
            <CalendarDays className="h-4 w-4" />
            Book your stay
          </Link>
        </div>

        <button
          className="block rounded-full p-2 text-white lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>

        <nav
          className={`fixed right-0 top-0 h-screen w-[30%] bg-[#1f5b52] shadow-2xl transition-transform duration-300 lg:static lg:flex lg:h-auto lg:w-auto lg:max-w-none lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          } lg:translate-x-0`}
        >
          <button
            className="absolute right-4 top-4 block text-white lg:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-7 w-7" />
          </button>

          <ul className="mt-20 flex flex-col items-start gap-1 px-6 lg:mt-0 lg:flex-row lg:items-center lg:gap-2 lg:px-0">
            {navItems.map((item) => (
              <li key={item}>
                <Link
                  to={`/${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-semibold text-white transition duration-300 hover:bg-[#295046] lg:rounded-full"
                >
                  {item}
                </Link>
              </li>
            ))}

            <li className="w-full lg:w-auto">
              {isLoading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
              ) : user ? (
                <div className="relative" ref={logoutMenuRef}>
                  <img
                    src={user.photo || `/static/user.png`}
                    alt="User Avatar"
                    className="h-10 w-10 cursor-pointer rounded-full border border-white/30 object-cover shadow"
                    onClick={() => setShowLogoutMenu((prev) => !prev)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/static/user.png`;
                    }}
                  />

                  {showLogoutMenu && (
                    <div className="absolute right-0 z-50 mt-5 w-48 rounded-2xl border border-white/20 bg-[#295046] shadow-xl">
                      <ul className="py-2">
                        <li>
                          <Link
                            to="/profile"
                            className="block w-full px-4 py-2 text-left text-white hover:bg-[#1f5b52]"
                            onClick={() => {
                              setShowLogoutMenu(false);
                              setIsMenuOpen(false);
                            }}
                          >
                            Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/booking-history"
                            className="block w-full px-4 py-2 text-left text-white hover:bg-[#1f5b52]"
                            onClick={() => {
                              setShowLogoutMenu(false);
                              setIsMenuOpen(false);
                            }}
                          >
                            Your Bookings
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={() => setShowConfirmModal(true)}
                            className="block w-full px-4 py-2 text-left text-orange-300 hover:bg-[#1f5b52]"
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
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 font-medium text-[#1f5b52] transition-all duration-300 hover:bg-[#f0f0f0] lg:mt-0 lg:w-auto"
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </nav>
      </header>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 text-center shadow-2xl">
            <h2 className="mb-3 text-xl font-semibold text-[#17322e]">Sign out?</h2>
            <p className="text-sm text-[#6f746d]">
              You can log back in anytime to continue your booking.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleLogout}
                className="rounded-full bg-[#c97953] px-5 py-2.5 text-white transition hover:bg-[#b26542]"
              >
                {isLoading ? "Logging out..." : "Yes, Logout"}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-full bg-[#f1ebdf] px-5 py-2.5 text-[#17322e] transition hover:bg-[#e5dccb]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
