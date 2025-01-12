
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import HomePage from './pages/HomePage';
import Rooms from './pages/Rooms';
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 
import './App.css';
import RoomDetails from './pages/RoomDetails';
import { rooms } from './constants/Rooms';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from './contexts/CartContext';
import Cart from './components/Cart';

const App = () => {



  return (
    <Router>
      <GoogleOAuthProvider clientId="1087462481925-43vqlkhqv232k6p5773d8j66sbnfbcve.apps.googleusercontent.com">
        <Navbar />  
        <AnimatedRoutes />
      </GoogleOAuthProvider>
      <Footer />
    </Router>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <CartProvider>
    <SwitchTransition mode="out-in">
      <CSSTransition key={location.pathname} classNames="fade" timeout={500} >
        <div className="page">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/rooms" element={<Rooms />} />
            
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>
      </CSSTransition>
    </SwitchTransition>
    </CartProvider>
  );
};

export default App;