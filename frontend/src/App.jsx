import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import HomePage from './pages/HomePage';
import Rooms from './pages/Rooms';
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 
import './App.css';
import RoomDetails from './pages/RoomDetails';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from './contexts/CartContext';
import { DateProvider } from './contexts/DateContext';
import Cart from './components/Cart';
import BookingConfirmation from './pages/BookingConfirmation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <GoogleOAuthProvider clientId="1087462481925-43vqlkhqv232k6p5773d8j66sbnfbcve.apps.googleusercontent.com">
      <CartProvider>
        <DateProvider> {/* Wrap DateProvider here */}
          <Router>
            <Navbar />
            <AnimatedRoutes />
            <Footer />
            <ToastContainer />
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
      <CSSTransition
        key={location.pathname}
        classNames="fade"
        timeout={500}
      >
        <div className="page">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />

            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
};

export default App;
