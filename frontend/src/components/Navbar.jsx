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
      if (
        logoutMenuRef.current &&
        !logoutMenuRef.current.contains(event.target)
      ) {
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

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
  const logoTextClasses = isHomePage && !isScrolled ? "text-white" : "text-white";
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
        className={`fixed left-0 right-0 z-50 mx-auto flex h-[74px] w-full items-center justify-between px-4 sm:px-6 lg:px-10 transition-all duration-300 ${headerClasses}`}
      >
        <Link to="/home" className={`flex items-center gap-3 transition-all duration-300 ${isHomePage && !isScrolled ? "flex-1" : ""}`}>
          {/* Logo with subtle shadow for visibility */}
          <div className={`rounded-lg transition-all duration-300 ${isHomePage && !isScrolled ? "h-16" : "h-14 w-14 overflow-hidden"}`}>
            <img
              src="/logo.png"
              alt="Geeta Homestay logo"
              className={`object-contain shadow-md transition-all duration-300 ${isHomePage && !isScrolled ? "h-full" : "h-full w-full"}`}
            />
          </div>
          <div className={logoTextClasses}>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] opacity-80">
              Geeta Homestay
            </p>
            <p className={`font-medium opacity-90 ${isHomePage && !isScrolled ? "block text-base" : "hidden text-sm sm:block"}`}>
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
          className={`block rounded-full p-2 md:hidden ${isHomePage && !isScrolled ? "text-white" : "text-[#17322e]"}`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>

        <nav
          className={`fixed right-0 top-0 h-full w-[84%] max-w-sm border-l border-[#e3dacb] bg-[#fffaf2] p-8 shadow-2xl transition-transform duration-300 md:static md:flex md:h-auto md:w-auto md:max-w-none md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          } md:translate-x-0`}
        >
          <button
            className="mb-6 block text-[#17322e] md:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-7 w-7" />
          </button>

          <ul className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-2">
            {navItems.map((item) => (
              <li key={item}>
                <Link
                  to={`/${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block rounded-full px-4 py-2 text-base font-semibold transition duration-300 ${linkClasses}`}
                >
                  {item}
                </Link>
              </li>
            ))}

            <li className="w-full md:w-auto">
              {isLoading ? (
                <div className="h-8 w-8 rounded-full border-4 border-[#1f5b52] border-t-transparent animate-spin" />
              ) : user ? (
                <div className="relative" ref={logoutMenuRef}>
                  <img
                    src={user.photo || `/static/user.png`}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full border border-[#d8d0c1] object-cover shadow cursor-pointer"
                    onClick={() => setShowLogoutMenu((prev) => !prev)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/static/user.png`;
                    }}
                  />

                  {showLogoutMenu && (
                    <div className="absolute right-0 mt-5 w-48 rounded-2xl border border-[#e2d8c9] bg-white shadow-xl z-50">
                      <ul className="py-2">
                        <li>
                          <Link
                            to="/profile"
                            className="block w-full px-4 py-2 text-left text-[#17322e] hover:bg-[#f7efe3]"
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
                            className="block w-full px-4 py-2 text-left text-[#17322e] hover:bg-[#f7efe3]"
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
                            className="block w-full px-4 py-2 text-left text-[#8b4e31] hover:bg-[#fff1ea]"
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
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#1f5b52] px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-[#17322e] md:mt-0 md:w-auto"
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
