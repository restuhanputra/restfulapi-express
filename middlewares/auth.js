const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // if header auth is exist
  if (authHeader) {
    console.log('bearer token:', authHeader);

    // split bearer token
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          status: 403,
          message: 'Invalid token',
        });
      }

      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({
      status: 401,
      message: 'Invaled or expired token',
    });
  }
};

module.exports = {
  auth: auth,
};
