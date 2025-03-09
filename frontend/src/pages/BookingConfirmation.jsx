import { useEffect } from "react";
import { useContext } from "react";
import { CheckCircle } from "lucide-react";
import { UserContext } from "../auth/Userprovider";
import { useLocation, useNavigate } from "react-router-dom";

const BookingConfirmation = () => {
  const { user } = useContext(UserContext); 
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.fromCart) {
      navigate("/cart");
    }
  }, [location, navigate]);

  // Safely extract bookingId
  const bookingId = location.state?.bookingDetails?.bookings?.[0]?.bookingId;

  useEffect(() => {
    sendEmail();
  }, [bookingId]);

  const sendEmail = async () => {
    if (!bookingId) return; 

    try {
      const response =  await fetch(`${import.meta.env.VITE_BACKEND_URL}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error.message);
    }
  };



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 text-center max-w-md">
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto" />
        <h2 className="text-2xl font-semibold mt-4">Booking Confirmed!</h2>
        <p className="text-gray-600 mt-2">
          Your booking has been successfully confirmed.
        </p>
        <p className="text-gray-600 mt-2">
          An invoice has been sent to <strong>{user?.email}</strong>.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
