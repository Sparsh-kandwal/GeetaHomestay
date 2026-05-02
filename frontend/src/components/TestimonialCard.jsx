const TestimonialCard = ({ username, testimonial, rating, image }) => {
  const starCount = Math.max(0, Math.min(5, parseInt(rating, 10) || 0));
  const stars = Array.from({ length: 5 }, (_, index) =>
    index < starCount ? "★" : "☆"
  );

  return (
    <div className="w-full rounded-[28px] border border-[#e8dfd0] bg-white p-6 shadow-[0_18px_38px_rgba(23,50,46,0.08)] sm:p-8">
      <div className="flex items-center gap-4">
        <img
          src={image || `/static/user.png`}
          alt={username || "Guest avatar"}
          className="h-14 w-14 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `/static/user.png`;
          }}
        />
        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold text-[#17322e]">{username}</h3>
          <div className="mt-1 text-lg text-[#d38c37]" aria-label={`${starCount} stars`}>
            {stars.map((star, index) => (
              <span key={index}>{star}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-5 text-sm leading-7 text-[#5e635d] sm:text-base">
        “{testimonial}”
      </p>
    </div>
  );
};

export default TestimonialCard;
