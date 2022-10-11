const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const { response } = require('../utils/helper.utils');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // if header auth is exist
  if (authHeader) {
    // split bearer token
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        response(res, 401, null, null, err, 'Expired token');
      }
      req.user = user;
      next();
    });
  } else {
    response(res, 401, null, null, null, 'Invalid token');
  }
};

module.exports = {
  auth: auth,
};
