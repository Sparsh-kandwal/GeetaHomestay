import React from 'react';

const TestimonialCard = ({ username, testimonial, rating, image }) => {
  const starCount = parseInt(rating, 10); // Extract the numeric part of the rating string (e.g., '5 stars' -> 5)
  const stars = Array.from({ length: 5 }, (_, index) => index < starCount ? '★' : '☆'); // Create star rating
  console.log(image)

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl mx-auto">
      {/* Display the image */}
      <div className="flex items-center">
        {/* Add the image and ensure it has a fixed size and is rounded */}
        <img 
          src={image} 
          alt={`${username}'s profile`} 
          className="w-16 h-16 rounded-full object-cover" 
          style={{ objectFit: 'cover', display: 'block', width: '64px', height: '64px' }} 
        />
        <h3
          className="ml-4 text-2xl font-semibold text-[#3a328c] truncate"
          style={{ maxWidth: '200px' }}
        >
  {username}
</h3>

      </div>
      <p className="text-gray-600 mt-4 text-lg">{testimonial}</p>

      {/* Display stars */}
      <div className="text-yellow-500 mt-2" aria-label={`${starCount} stars`}>
        {stars.map((star, index) => (
          <span key={index} className="text-xl">{star}</span>
        ))}
      </div>
    </div>
  );
};

export default TestimonialCard;
