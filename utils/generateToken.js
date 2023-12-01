import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  //set JWT as HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'Strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
