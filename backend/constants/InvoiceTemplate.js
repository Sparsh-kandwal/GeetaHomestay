export const InvoiceTemplate = ({ bookingId, userEmail, userName, totalAmount, bookings }) => `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; padding: 0; background-color: #f8f8f8; }
        .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #fff; }
        h1, h2, h3 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f4f4f4; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 10px; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Geeta HomeStay</h1>
        <p>Geeta Bhawan, near Petrol Pump, Karanprayag, Chamoli, Uttarakhand</p>
        <p>Phone: +91 9756198989 | Email: geetahomestaykpg@gmail.com</p>
        
        <h2>Booking Invoice</h2>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        
        <h3>Booking Details</h3>
        <table>
          <tr>
            <th>Room Type</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Amount (₹)</th>
          </tr>
          ${bookings
            .map(
              (b) => `
            <tr>
              <td>${b.roomType}</td>
              <td>${b.checkIn}</td>
              <td>${b.checkOut}</td>
              <td>${b.amount}</td>
            </tr>
          `
            )
            .join("")}
        </table>
        
        <p class="total">Total Amount: ₹${totalAmount}</p>
        
        <h3>Terms & Conditions</h3>
        <ul>
          <li>Check-out time is 10:30 AM.</li>
          <li>Early check-in or late check-out is subject to availability.</li>
          <li>No Cancellation and Refund</li>
          <li>Damage to property will be charged accordingly.</li>
          <li>This is a computer-generated invoice and does not require a signature.</li>
        </ul>
        
        <p>Thank you for choosing Geeta Homestay! We hope you enjoy your stay.</p>
      </div>
    </body>
  </html>
`;
