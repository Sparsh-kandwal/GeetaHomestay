import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import HomePage from "./pages/HomePage";
import Rooms from "./pages/Rooms";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";
import RoomDetails from "./pages/RoomDetails";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "./contexts/CartContext";
import { DateProvider } from "./contexts/DateContext";
import Cart from "./components/Cart";
import BookingConfirmation from "./pages/BookingConfirmation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./pages/Profile";
import BookingHistory from "./pages/BookingHistory";
import ScrollToTop from "./components/ScrollToTop";
import InfoTicker from "./components/InfoTicker";

//final build
const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <CartProvider>
        <DateProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <div className="fixed top-0 left-0 right-0 z-50 bg-white">
                <Navbar />
              </div>
              <div className="flex-grow  ">
                <AnimatedRoutes />
              </div>
              <Footer />
              <ToastContainer />
            </div>
          
          </Router>
        </DateProvider>
      </CartProvider>
    </GoogleOAuthProvider>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition key={location.pathname} classNames="fade" timeout={500}>
        <div className="page">
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/booking-history" element={<BookingHistory />} />

          </Routes>
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
};
export default App;