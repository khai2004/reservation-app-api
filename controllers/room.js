import asyncHandler from '../middleware/asyncHandler.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

export const getSingleRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (room) {
    res.status(200).json(room);
  } else {
    res.status(400);
    throw new Error('Something went wrong');
  }
});

export const createRoom = asyncHandler(async (req, res) => {
  const hotelId = req.params.hotelid;
  const newRoom = new Room(req.body);
  const createdRoom = await newRoom.save();
  await Hotel.findByIdAndUpdate(hotelId, { $push: { rooms: createdRoom._id } });
  if (createdRoom) {
    res.status(200).json(createdRoom);
  } else {
    res.status(400);
    throw new Error('Something went wrong');
  }
});

export const deleteRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  try {
    await Room.findByIdAndDelete(req.params.id);
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.params.id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json('Room has been deleted.');
  } catch (err) {
    next(err);
  }
};

export const updateRoom = asyncHandler(async (req, res) => {
  const updateRoom = await Room.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );

  if (updateRoom) {
    res.status(200).json(updateRoom);
  } else {
    res.status(400);
    throw new Error('Something went wrong');
  }
});

export const updateRoomAvailability = async (req, res, next) => {
  try {
    await Room.updateOne(
      { 'roomNumbers._id': req.params.id },
      {
        $push: {
          'roomNumbers.$.unavailableDates': req.body,
        },
      }
    );
    res.status(200).json('Room status has been updated.');
  } catch (err) {
    next(err);
  }
};
