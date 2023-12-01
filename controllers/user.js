import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const register = asyncHandler(async (req, res) => {
  const newUser = req.body;
  const { email } = newUser;

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create(newUser);
  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      country: user.country,
      phone: user.phone,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Invalid User data');
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      creatAt: user.createdAt,
      updateAt: user.updateAt,
      image: user.image,
    });
  } else {
    res.status(401);
    throw Error('Invalid email or password');
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

const getUsers = asyncHandler(async (req, res) => {
  const user = await User.find();
  res.status(200).json({ user });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Something wrong. Please try again! ');
  }
});
const updateUser = asyncHandler(async (req, res) => {
  const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (updateUser) {
    res.status(201).json(updateUser);
  } else {
    res.status(400);
    throw new Error('Something wrong. Please try again! ');
  }
});
const deleteUser = asyncHandler(async (req, res) => {
  const deleteUser = await User.findByIdAndDelete(req.params.id, req.body, {
    new: true,
  });
  if (deleteUser) {
    res.status(201).json('Delete success!');
  } else {
    res.status(400);
    throw new Error('Something wrong. Please try again! ');
  }
});
export {
  register,
  getUsers,
  authUser,
  logoutUser,
  updateUser,
  getUser,
  deleteUser,
};
