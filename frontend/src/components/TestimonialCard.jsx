import React from 'react';

const TestimonialCard = ({ username, testimonial, rating }) => {
  const stars = Array.from({ length: 5 }, (_, index) => index < rating ? '★' : '☆'); // Create star rating

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl mx-auto">
      <h3 className="text-2xl font-semibold text-[#3a328c]">{username}</h3>
      <p className="text-gray-600 mt-4 text-lg">{testimonial}</p>
      <div className="text-yellow-500 mt-2">
        {stars.map((star, index) => (
          <span key={index} className="text-xl">{star}</span>
        ))}
      </div>
    </div>
  );
};

export default TestimonialCard;
