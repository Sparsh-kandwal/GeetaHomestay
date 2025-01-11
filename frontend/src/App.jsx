
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

const App = () => {



  return (
    <Router>
       (
        <div>
          <Navbar />
          <AnimatedRoutes />
          <Footer />
        </div>
      )
    </Router>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition key={location.pathname} classNames="fade" timeout={500} >
        <div className="page">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/bookings" element={<Rooms />} />
            
            <Route path="/rooms/:id" element={<RoomDetails />} />
          </Routes>
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
};

export default App;