// frontend/src/pages/NotFound.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <Link to="/" className="text-indigo-600 hover:underline">
                Go back to Home
            </Link>
        </div>
    );
};

export default NotFound;