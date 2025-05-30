import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/routes.js';
import authroutes from './routes/authrouter.js'
import payment_routes from './routes/payment_routes.js'

import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const allowedOrigins = [
    process.env.CLIENT_URL,
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);  // Allow request from the origin
        } else {
            console.error(`CORS blocked request from origin: ${origin}`);  // Log blocked requests
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.options('*', (req, res) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.sendStatus(204);
    }
    return res.status(403).json({ message: 'CORS not allowed for this origin' });
});
app.use(cookieParser());

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI || '', {
      });
      console.log('MongoDB connected');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1);
    }
  };
connectDB();
// Routes
app.use('/', routes);
app.use('/auth', authroutes);
app.use('/payment', payment_routes);

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is listening on port: ${process.env.PORT || 5000}`);
});
