import express from 'express';
import connectDB from './config/connectDB.js';
import dotenv from 'dotenv';
import authRoute from './routes/user.route.js';
import hotelRoute from './routes/hotel.route.js';
import romeRoute from './routes/room.route.js';
import orderRoute from './routes/order.route.js';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import cors from 'cors';
import Hotel from './models/Hotel.js';
import { sampleHotels } from './data/data.js';
dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_API,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/api', authRoute);
app.use('/api/hotels', hotelRoute);
app.use('/api/rooms', romeRoute);
app.use('/api/orders', orderRoute);
app.use('/', (req, res) => {
  res.send('Connect successfull');
});

app.use(notFound);
app.use(errorHandler);

app.listen(9000, async () => {
  await connectDB();

  // Hotel.insertMany(sampleHotels);

  console.log('Listening in port 9000');
});
