export const emailTemplate = (guestName) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #2a9d8f;
            color: white;
            padding: 30px;
            text-align: center;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
            font-size: 16px;
            color: #444444;
        }
        .content p {
            margin-bottom: 15px;
        }
        .footer {
            background-color: #f7f7f7;
            color: #777777;
            text-align: center;
            padding: 15px 30px;
            font-size: 13px;
        }
        .footer a {
            color: #2a9d8f;
            text-decoration: none;
            font-weight: bold;
        }
        .button {
            background-color: #2a9d8f;
            color: white;
            padding: 12px 25px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #21867a;
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
            <p>Welcome to Geeta Home Stay!</p>
            <p>Thank you for signing up. Your account has been successfully created, and we're excited to have you on board.</p>
            <p>From here, you can explore our rooms, manage your bookings, and discover local attractions to make your stay memorable. If you need any assistance or have special requests, feel free to reach out—we’re always here to help.</p>
            <p>Let’s make your experience with Geeta Home Stay warm, comfortable, and unforgettable!</p>

        </div>
        <div class="footer">
            <p>Geeta Home Stay | Your Home Away from Home</p>
            <p><a href="https://www.geetahomestay.in">www.geetahomestay.in</a> | Contact: +91 9756198989</p>
        </div>
    </div>
</body>
</html>
`;
