import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/Order.js';
import { ObjectId } from 'mongodb';
import User from '../models/User.js';
import Room from '../models/Room.js';

export const createOrder = asyncHandler(async (req, res) => {
  const {
    hotel,
    roomDetail,
    roomReserve,
    roomsPrice,
    dateNumber,
    taxPrice,
    totalPrice,
    request,
  } = req.body;

  console.log(req.user._id);
  const newHotel = new ObjectId(hotel);
  const roomDetailtemp = roomDetail.map((room) => ({
    ...room,
    roomId: new ObjectId(room.roomId),
  }));
  console.log(roomDetailtemp);
  if (roomReserve && roomReserve.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      user: req.user._id,
      hotel: newHotel,
      roomDetail: roomDetailtemp,
      roomReserve: roomReserve,
      roomsPrice: roomsPrice,
      dateNumber: dateNumber,
      taxPrice: Number(taxPrice),
      totalPrice: Number(totalPrice),
      request: request,
    });

    await Promise.all(
      roomReserve.map(async (room) => {
        await Room.updateOne(
          { 'roomNumbers._id': room.numberId },
          {
            $push: {
              'roomNumbers.$.unavailableDates': dateNumber,
            },
          }
        );
      })
    );
    const createdOrder = await order.save();
    console.log(createdOrder);
    res.status(201).json(createdOrder);
  }
});

export const getAllOrder = asyncHandler(async (req, res) => {
  const order = await Order.find()
    .populate({
      path: 'user',
      select: '_id username email phone',
    })
    .populate({ path: 'hotel', select: 'title type' });
  if (order) {
    res.status(200).json(order);
  } else {
    res.status(400);
    throw new Error('unauthorized access!');
  }
});

export const getOrdersByUser = asyncHandler(async (req, res) => {
  const order = await Order.find({ user: req.user._id })
    .populate({
      path: 'user',
      select: 'username email phone',
    })
    .populate({ path: 'hotel', select: 'title type photo' });
  if (order) {
    res.status(200).json(order);
  } else {
    res.status(400);
    throw new Error('No order items');
  }
});

export const getSingleOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'username email phone address country zip',
    })
    .populate({ path: 'hotel', select: 'title type address' });

  if (order.user._id === req.user._id || req.user.isAdmin) {
    res.status(200).json(order);
  } else {
    res.status(400);
    throw new Error('unauthorized access!');
  }
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const ownerUser = await Order.findById(req.params.id);

  if (user.isAdmin || ownerUser.user === req.user._id) {
    const order = await Order.findByIdAndDelete(req.params.id);
    await Promise.all(
      ownerUser.roomReserve.map(async (room) => {
        await Room.updateOne(
          { 'roomNumbers._id': room.numberId },
          {
            $pull: {
              'roomNumbers.$.unavailableDates': { $in: ownerUser.dateNumber },
            },
          }
        );
      })
    );
    if (order) {
      res.status(200).json('Delete success!');
    }
  } else {
    res.status(400);
    throw new Error('Unauthorized access!');
  }
});

export const updateOrder = asyncHandler(async (req, res) => {
  console.log(req.body);
  const updateOrder = await Order.findByIdAndUpdate(
    req.params.id,
    { confirm: req.body.confirm },
    {
      new: true,
    }
  );
  console.log(req.body.confirm);

  if (updateOrder) {
    res.status(200).json(updateOrder);
  } else {
    res.status(400);
    throw new Error('unauthorized access!');
  }
});
