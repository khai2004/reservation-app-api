import express from 'express';

const router = express.Router();
import { admin, protect } from '../middleware/authMiddleware.js';
import {
  createOrder,
  deleteOrder,
  getAllOrder,
  getOrdersByUser,
  getSingleOrder,
  updateOrder,
} from '../controllers/order.js';

router.route('/admin/getall').get(protect, admin, getAllOrder);
router.route('/').post(protect, createOrder).get(protect, getOrdersByUser);
router
  .route('/:id')
  .delete(protect, deleteOrder)
  .get(protect, getSingleOrder)
  .patch(protect, admin, updateOrder);

export default router;
