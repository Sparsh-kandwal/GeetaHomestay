// frontend/src/App.jsx

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
import Profile from './pages/Profile';
import BookingHistory from './pages/BookingHistory';
import { UserProvider,RoomProvider } from './auth/Userprovider';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
const App = () => {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <CartProvider>
        <DateProvider>
          <UserProvider>
            <Router>
              <Navbar />
              <AnimatedRoutes />
              <Footer />
              <ToastContainer />
            </Router>
          </UserProvider>
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
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Protected Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/booking-history" 
              element={
                <ProtectedRoute>
                  <BookingHistory />
                </ProtectedRoute>
              } 
            />
            
            {/* Add a catch-all route for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
};
export default App;