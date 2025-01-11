export const emailTemplate = (guestName) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .footer {
            background-color: #f4f4f4;
            text-align: center;
            color: #888888;
            padding: 10px 20px;
            font-size: 12px;
        }
        a {
            color: #4CAF50;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Geeta Home Stay!</h1>
        </div>
        <div class="content">
            <p>Dear ${guestName},</p>
            <p>We are thrilled to have you as part of our Geeta Home Stay family! Thank you for choosing us for your stay. We are committed to making your experience comfortable, memorable, and truly special.</p>
            <p>Whether you're here for a relaxing vacation or an adventurous getaway, our team is here to assist you at every step. If you have any special requests or need assistance, please do not hesitate to reach out.</p>
            <p>Here’s to a wonderful and rejuvenating stay!</p>
            <p>Warm regards,</p>
            <p><strong>The Geeta Home Stay Team</strong></p>
        </div>
        <div class="footer">
            <p>Geeta Home Stay | Your Home Away from Home</p>
            <p><a href="https://www.geetahomestay.com">www.geetahomestay.com</a> | Contact: +91-XXXXXXXXXX</p>
        </div>
    </div>
</body>
</html>
`;
