import React from 'react';

const LoadingCard = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-3/5 mx-auto">
      {/* Skeleton for the image */}
      <div className="flex items-center">
        <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse"></div> {/* Skeleton circle */}
        <div className="ml-4 w-32 h-6 bg-gray-300 animate-pulse"></div> {/* Skeleton for the username */}
      </div>
      
      {/* Skeleton for the testimonial text */}
      <div className="mt-4 h-12 bg-gray-300 animate-pulse"></div> {/* Skeleton for testimonial */}

      {/* Skeleton for stars */}
      <div className="mt-2 flex space-x-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="w-6 h-6 bg-gray-300 animate-pulse"></div> // Skeleton for each star
        ))}
      </div>
    </div>
  );
};

export default LoadingCard;
