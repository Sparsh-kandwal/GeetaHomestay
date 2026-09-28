import axios from "axios";

export const checkouthandler = async (bookingIdOrAmount, user, callback, options = {}) => {
  try {
    const bookingId = options.bookingId || (typeof bookingIdOrAmount === "string" ? bookingIdOrAmount : null);

    const {
      data: { order },
    } = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/payment/checkout`,
      {
        bookingId,
      },
      { withCredentials: true }
    );

    const {
      data: { key },
    } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payment/getKey`, { withCredentials: true });

    if (!user || !user._id) {
      console.error("User data is missing.");
      return;
    }

    const razor = new Razorpay({
      key,
      amount: order.amount, // Server-computed amount in paise
      currency: "INR",
      name: "Geeta HomeStay",
      description: "Room Booking Payment",
      image: "frontend/public/logo.png",
      order_id: order.id,
      handler: async (response) => {
        try {
          const verificationRes = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/payment/paymentVerification`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { withCredentials: true }
          );

          if (verificationRes.data.success) {
            callback(verificationRes.data.paymentId);
          } else {
            console.error("Payment verification failed on backend.");
          }
        } catch (error) {
          console.error("Payment verification failed:", error);
        }
      },
      prefill: {
        name: user?.userName || "",
        email: user?.email || "",
      },
      notes: {
        address: "Geeta HomeStay, Uttarakhand",
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        escape: false,
        ondismiss: () => {},
      },
    });

    razor.open();
  } catch (error) {
    console.error("Payment Error:", error);
  }
};
