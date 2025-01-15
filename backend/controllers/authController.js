import jwt from 'jsonwebtoken';
import User from "../models/user.js";
import { emailTemplate } from '../constants/EmailTemplate.js';
import { transporter } from '../utils/MailClient.js';
/**
 * Google Authentication Handler
 */
export const googleAuth = async (req, res) => {
    const code = req.body.code; // Authorization code sent from the frontend
    if (!code) {
        return res.status(400).json({ message: 'Authorization code is missing' });
    }
    try {
        const data = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        };

        // Exchange authorization code for access token
        const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data).toString(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        const access_token_data = await response.json();
        const { access_token, expires_in } = access_token_data;

        // Fetch user info using the access token
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!userInfoResponse.ok) {
            const errorData = await userInfoResponse.json();
            throw new Error(JSON.stringify(errorData));
        }

        const userInfo = await userInfoResponse.json();
        let user = await User.findOne({ id: userInfo.id });
        let isNewUser = false;
        if (!user) {
            user = await User.create({
                id: userInfo.id,
                userName: userInfo.name,
                email: userInfo.email,
                photo: userInfo.picture,
            });
            isNewUser = true;
        }

        const tokenPayload = { id: user._id, email: user.email };
        const secretKey = process.env.JWT_SECRET; 
        const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '5d' }); // Set custom expiry of 5 days
        res.cookie('accessToken', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days expiry
            secure: true,
            sameSite: 'strict',
        });


        // abhi isko only for new user karunga,  testing ke liye chodd rkha 
        try {
            const emailContent = emailTemplate(userInfo.name);
    
            const info = await transporter.sendMail({
                from: '"Geeta Home Stay" <geetahomestaykaranprayag@gmail.com>',
                to: userInfo.email,
                subject: "Welcome to Geeta Home Stay!",
                text: "Testing going on",
                html: emailContent,
            });
    
            console.log("Welcome email sent successfully to:", userInfo.email);
        } catch (emailError) {
            console.error("Error sending welcome email:", emailError.message);
        }
        
        
        res.status(200).json({
            message: "User info retrieved successfully",
            user: user,
        });

    } catch (error) {
        console.error('Error during Google Auth:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve user info',
            error: {
                message: error.message,
                response: error.response ? error.response.data : null,
            },
        });
    }
};

/**
 * Get Current User Profile
 */
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User profile retrieved", user });
    } catch (error) {
        console.error('Error during getMyProfile:', error.message);
        res.status(500).json({
            message: 'Failed to retrieve user profile',
            error: error.message
        });
    }
};

/**
 * Update User Profile
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userName, phoneNumber, photo } = req.body;

        const updatedData = {
            userName,
            phoneNumber,
            photo,
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Optionally, update the JWT if necessary
        // For simplicity, we'll keep the existing token until it expires

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error during updateProfile:', error.message);
        res.status(500).json({
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

/**
 * Logout Handler
 */
export const logout = async (req, res, next) => {
    try {
        res
            .status(200)
            .clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            })
            .json({
                success: true,
                message: "Logged out successfully",
            });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};