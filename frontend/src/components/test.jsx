// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import HomePage from './pages/HomePage';
import Rooms from './pages/Rooms';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css'; // Ensure the appropriate CSS file for transitions
import RoomDetails from './pages/RoomDetails';

const App = () => {
    return (
        <Router>
            <Navbar />
            <AnimatedRoutes />
            <Footer />
        </Router>
    );
};

const AnimatedRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PageTransition>
                        <HomePage />
                    </PageTransition>
                }
            />
            <Route
                path="/home"
                element={
                    <PageTransition>
                        <HomePage />
                    </PageTransition>
                }
            />
             <Route path="/bookings" element={<Rooms />} />
            <Route
                path="/rooms"
                element={
                    <PageTransition>
                        <Rooms />
                    </PageTransition>
                }
            >
                <Route path=":id" element={<RoomDetails />} />
            </Route>

        </Routes>
    );
};

const PageTransition = ({ children }) => {
    const location = useLocation();
    return (
        <SwitchTransition mode="out-in">
            <CSSTransition key={location.pathname} classNames="fade" timeout={500}>
                <div className="page">{children}</div>
            </CSSTransition>
        </SwitchTransition>
    );
};

export default App;