const BookingCard = ({ booking }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-300 hover:shadow-2xl transition-shadow duration-300">
      {/* Booking ID */}
      <h3 className="text-sm font-semibold text-gray-600 tracking-wide uppercase mb-3 ">
        Booking ID: <span className="text-gray-900">{booking.bookingId}</span>
      </h3>

      {/* Check-in & Check-out Info */}
      <div className="flex flex-col sm:flex-row justify-between border-b pb-3 mb-4 gap-6">
        <div className="text-gray-700 text-center flex-1">
          <p className="text-sm font-medium uppercase tracking-wide">Check-In</p>
          <p className="text-gray-900 font-bold text-lg">{formatDate(booking.checkIn)}</p>
        </div>
        <div className="text-gray-700 text-center flex-1">
          <p className="text-sm font-medium uppercase tracking-wide">Check-Out</p>
          <p className="text-gray-900 font-bold text-lg">{formatDate(booking.checkOut)}</p>
        </div>
      </div>

      {/* Room Types */}
      <div className="mb-4">
        <p className="text-gray-700 font-semibold mb-2">Room Types:</p>
        <ul className="list-none space-y-1">
          {booking.roomTypes.map((roomType, index) => (
            <li key={index} className="text-gray-800 font-medium bg-gray-100 px-3 py-1 rounded-md">
              {roomType}
            </li>
          ))}
        </ul>
      </div>

      {/* Total Amount */}
      <div className="text-right text-lg font-bold text-green-700">
        ₹{booking.totalAmount.toLocaleString()}
      </div>
    </div>
  );
};

export default BookingCard;
