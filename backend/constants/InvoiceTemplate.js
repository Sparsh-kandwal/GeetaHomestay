export const InvoiceTemplate = ({ bookingId, userEmail, userName, totalAmount, bookings }) => `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; padding: 0; }
        .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
        h2 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f4f4f4; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Booking Invoice</h2>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>

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
        <p>Thank you for booking with Geeta Home Stay!</p>
      </div>
    </body>
  </html>
`;
