// server.js is the entry point of the backend application.
// It sets up and starts the Express server, connects to the MongoDB database,
// and configures middleware and API routes. This file is needed to initialize
// the backend, handle HTTP requests, and serve as the main controller for the app.

// Import required modules
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import usersRouter from './routes/users.js';
import mediaRouter from './routes/media.js';
import ratingRoutes from './routes/ratings.js';
import authRoutes from "./routes/auth.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});


app.use('/users', usersRouter);
app.use('/media', mediaRouter);
app.use('/ratings', ratingRoutes);
app.use("/auth", authRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
