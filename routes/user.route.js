import express from 'express';
import {
  register,
  authUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  logoutUser,
} from '../controllers/user.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.route('/login').post(authUser);
router.post('/logout', logoutUser);
router.get('/users', protect, admin, getUsers);
router
  .route('/users/:id')
  .patch(protect, updateUser)
  .delete(protect, deleteUser)
  .get(protect, getUser);

export default router;
