import asyncHandler from '../middleware/asyncHandler.js';
import Hotel from '../models/Hotel.js';
import Order from '../models/Order.js';
import Room from '../models/Room.js';

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

export const getHotels = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;
  const skip = (page - 1) * pageSize || 0;
  const filter = {};
  let price = 1;

  if (req.query.type) {
    filter.type = req.query.type;
  }

  if (req.query.price) {
    price = req.query.price;
  }

  if (req.query.rating) {
    const max = Number(req.query.rating) + 1;
    filter.rating = {
      $gte: Number(req.query.rating),
      $lt: Number(max),
    };
  }

  if (req.query.city) {
    const citySearch = new RegExp(req.query.city, 'i');
    filter.city = citySearch;
  }

  const hotels = await Hotel.find(filter)
    .skip(skip)
    .limit(pageSize)
    .sort({ cheapestPrice: price });

  const count = hotels.length;

  if (hotels) {
    res.status(200).json({ hotels, count: count });
  } else {
    res.status(400);
    throw new Error('Something wrong');
  }
});

export const getSingleHotel = asyncHandler(async (req, res) => {
  const singelHotel = await Hotel.findById(req.params.id);
  if (singelHotel) {
    res.status(200).json(singelHotel);
  } else {
    res.status(400);
    throw new Error('Something wrong');
  }
});

export const createHotel = asyncHandler(async (req, res) => {
  const newHotel = new Hotel(req.body);
  const savedHotel = await newHotel.save();
  if (savedHotel) {
    res.status(200).json(savedHotel);
  } else {
    res.status(400);
    throw new Error('Invalid User data');
  }
});

export const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  const roomDelete = await Promise.all(
    hotel.rooms.map((room) => {
      return Room.findByIdAndDelete(room);
    })
  );
  const imageId = hotel.photo.map((pho) => pho.public_id);

  if (!imageId.length === 0) {
    const result = await cloudinary.api.delete_resources(imageId);
  }

  const singelHotel = await Hotel.findByIdAndDelete(req.params.id);

  if (singelHotel && roomDelete) {
    res.status(200).json({ message: 'Deleted success' });
  } else {
    res.status(400);
    throw new Error('Something wrong');
  }
});

export const updateHotel = asyncHandler(async (req, res) => {
  const updateHotel = await Hotel.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  if (updateHotel) {
    console.log(updateHotel);
    res.status(200).json(updateHotel);
  } else {
    res.status(400);
    throw new Error('Something wrong');
  }
});

export const getTopHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({}).sort({ rating: -1 }).limit(4);
  res.status(200).json(hotels);
});

export const getHotelsRating = asyncHandler(async (req, res) => {
  console.log(req.query.city);
  const citySearch = new RegExp(req.query.city, 'i');
  const hotels = await Hotel.find({ city: citySearch });

  const typeNumber = {
    hotel: 0,
    apartment: 0,
    resort: 0,
    villas: 0,
    cabins: 0,
  };
  hotels.map((type) => {
    if (type.type === 'hotel') {
      typeNumber.hotel++;
    } else if (type.type === 'apartment') {
      typeNumber.apartment++;
    } else if (type.type === 'resort') {
      typeNumber.resort++;
    } else if (type.type === 'cabins') {
      typeNumber.cabins++;
    } else if (type.type === 'villas') {
      typeNumber.villas++;
    }
  });
  const ratingNumber = {
    star1: 0,
    star2: 0,
    star3: 0,
    star4: 0,
    star5: 0,
  };
  hotels.map((rating) => {
    if (rating.rating >= 1 && rating.rating < 2) {
      ratingNumber.star1++;
    } else if (rating.rating >= 2 && rating.rating < 3) {
      ratingNumber.star2++;
    } else if (rating.rating >= 3 && rating.rating < 4) {
      ratingNumber.star3++;
    } else if (rating.rating >= 4 && rating.rating < 5) {
      ratingNumber.star4++;
    } else if (rating.rating === 5) {
      ratingNumber.star5++;
    }
  });
  if (hotels && typeNumber && ratingNumber) {
    console.log(typeNumber, ratingNumber);

    res.status(200).json({ hotels, typeNumber, ratingNumber });
  } else {
    res.status(400);
    throw new Error('Something wrong');
  }
});

export const getHotelRooms = asyncHandler(async (req, res) => {
  const hotelRooms = await Hotel.findById({ _id: req.params.hotelid });
  const roomId = hotelRooms.rooms;
  const rooms = await Promise.all(
    roomId.map((room) => {
      return Room.findById(room);
    })
  );
  if (rooms) {
    res.status(200).json(rooms);
  } else {
    res.status(400);
    throw new Error('Something went wrong');
  }
});

export const createHotelReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const hotel = await Hotel.findById(req.params.id);
  const orders = await Order.find({ hotel: new Object(req.params.id) });
  if (hotel && orders) {
    const alreadyReviewed = hotel.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );
    const alreadyOrder = orders.find(
      (order) => order.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You already reviewed');
    }
    if (!alreadyOrder) {
      res.status(400);
      throw new Error('Please, check-in before review!');
    }
    const review = {
      username: req.user.username,
      rating: Number(rating),
      comment,
      user: req.user._id,
      image: req.user.image.public_id,
    };

    hotel.reviews.push(review);
    hotel.numReviews = hotel.reviews.length;
    hotel.rating = Number(
      (
        hotel.reviews.reduce((acc, review) => acc + review.rating, 0) /
        hotel.reviews.length
      ).toFixed(1)
    );

    await hotel.save();

    res.status(200).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});
