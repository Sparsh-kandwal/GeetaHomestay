import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import HomePage from './pages/HomePage';
import Rooms from './pages/Rooms';
import Navbar from './components/Navbar'; // Assuming you have a Navbar component
import Footer from './components/Footer'; // Assuming you have a Footer component
import './App.css';  // Ensure the appropriate CSS file for transitions
import { GoogleOAuthProvider } from "@react-oauth/google";

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
          </Routes>
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
};

export default App;
