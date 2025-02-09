// // frontend/src/components/ProtectedRoute.jsx

// import React, { useContext } from 'react';
// import { Navigate } from 'react-router-dom';
// import { UserContext } from '../auth/Userprovider';

// const ProtectedRoute = ({ children }) => {
//     const { user, isLoading } = useContext(UserContext);

//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <div className="w-8 h-8 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//         );
//     }

//     if (!user) {
//         return <Navigate to="/" replace />;
//     }

//     return children;
// };

// export default ProtectedRoute;