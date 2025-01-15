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
            <p>We are excited to welcome you to Geeta Home Stay! Thank you for choosing us for your upcoming stay. Our team is dedicated to providing you with a warm and comfortable environment to ensure you have a relaxing experience.</p>
            <p>If you need any assistance or have special requests, please do not hesitate to reach out to us. We are here to help with anything you may need, whether it’s planning your activities, arranging special amenities, or simply offering recommendations.</p>
            <p>We look forward to making your stay unforgettable!</p>
        </div>
        <div class="footer">
            <p>Geeta Home Stay | Your Home Away from Home</p>
            <p><a href="https://www.geetahomestay.com">www.geetahomestay.com</a> | Contact: +91 9756198989</p>
        </div>
    </div>
</body>
</html>
`;
