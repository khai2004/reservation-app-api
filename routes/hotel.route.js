import express from 'express';
import {
  getHotels,
  createHotel,
  getSingleHotel,
  deleteHotel,
  updateHotel,
  getTopHotels,
  getHotelsRating,
  getHotelRooms,
  createHotelReview,
} from '../controllers/hotel.js';
const router = express.Router();
import { admin, protect } from '../middleware/authMiddleware.js';

router.route('/').get(getHotels).post(protect, admin, createHotel);
router.get('/top', getTopHotels);
router.get('/rating', getHotelsRating);

router
  .route('/:id')
  .get(getSingleHotel)
  .put(protect, admin, updateHotel)
  .delete(protect, admin, deleteHotel);
router.route('/:id/reviews').post(protect, createHotelReview);
router.get('/rooms/:hotelid', getHotelRooms);
export default router;
