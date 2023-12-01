import express from 'express';
import {
  getSingleRoom,
  createRoom,
  deleteRoom,
  updateRoom,
  updateRoomAvailability,
} from '../controllers/room.js';
import { admin, protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/room/:id').put(protect, admin, updateRoom).get(getSingleRoom);

router.put('/availability/:id', protect, updateRoomAvailability);

router.delete('/room/:id/:hotelid', protect, admin, deleteRoom);

router.route('/:hotelid').post(protect, admin, createRoom);

export default router;
