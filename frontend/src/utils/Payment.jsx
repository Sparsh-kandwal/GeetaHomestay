import axios from 'axios';

export const checkouthandler = async (amount, user) => {
  try {
    console.log(user)
    const { data: { order } } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payment/checkout`, {
      amount
    });
    const { data: { key } } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payment/getKey`);

    if (!user || !user._id) {
      console.error("🔴 User data is missing!");
      return;
    }

    const options = {
      "key": key,
      "amount": order.amount,
      "currency": "INR",
      "name": "Geeta HomeStay",
      "description": "Test Transaction",
      "image": "frontend/public/logo.png",
      "order_id": order.id,
      "handler": async function (response) {
        try {
            const verificationRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payment/paymentVerification`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user._id,
                amount: order.amount, 
            });

            console.log("🟢 Payment Verification Response:", verificationRes.data);

        } catch (error) {
            console.error("🔴 Payment Verification Failed:", error);
        }
    },
      "prefill": {
        "name": user?.userName || "",
        "email": user?.email || "",
      },
      "notes": {
        "address": "Geeta HomeStay, Uttarakhand"
      },
      "theme": {
        "color": "#3399cc"
      },
      "modal": {
        escape: false,
        ondismiss: async function () {
            console.warn("🔴 User exited the payment process!");
            try {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payment/rollbackBooking`, { userId: user._id });
                console.log("🔄 Booking rolled back successfully!");
            } catch (rollbackError) {
                console.error("🔴 Booking rollback failed:", rollbackError);
            }
        }
    }
      
    };

    const razor = new Razorpay(options);
    razor.open();

  } catch (error) {
    console.error("Payment Error:", error);
  }
};
