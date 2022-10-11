const { User } = require('../models');
const Validator = require('fastest-validator');
const v = new Validator();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const { response } = require('../utils/helper.utils');

// create user (signup)
const signup = (req, res, next) => {
  const saltRounds = 10;

  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      const data = {
        username: req.body.username,
        password: hash,
        email: req.body.email,
        fullname: req.body.fullname,
        picture: req.body.picture,
        bio: req.body.bio,
        creatAt: new Date(),
        updatedAt: new Date(),
        createdBy: 0,
        updatedBy: 0,
        isDeleted: false,
      };

      // validation schema
      const schema = {
        username: { type: 'string', min: 5, max: 50, optional: false },
        email: { type: 'email', optional: false },
        password: { type: 'string', min: 5, max: 255, optional: false },
      };

      // cek email
      User.findOne({ where: { email: req.body } })
        .then((user) => {
          if (user) {
            // email available
            // res.status(400).json({
            //   status: 400,
            //   message: 'Email already exist',
            // });

            return response(res, 400, false, null, 'Email already exist');
          } else {
            // validation data
            const validationResult = v.validate(data, schema);

            if (validationResult !== true) {
              return response(
                res,
                400,
                null,
                false,
                validationResult,
                'Validation failed'
              );
            } else {
              // Email not available & Data validation success
              // create user
              User.create(data)
                .then((result) => {
                  response(res, 200, result, null, 'User created successfully');
                })
                .catch((err) => {
                  response(
                    res,
                    500,
                    null,
                    false,
                    null,
                    'Internal server error'
                  );
                });
            }
          }
        })
        .catch((err) => {
          response(res, 500, null, false, null, 'Internal server error');
        });
    });
  });
};

// read user
const read = (req, res, next) => {
  /** show all data except isDelete is true */
  User.findAll({
    where: { isDeleted: false },
  })
    .then((users) => {
      response(res, 200, users, true, null, null);
    })
    .catch((err) => {
      response(res, 500, null, false, null, 'Internal server error');
    });
};

// read by ID
const readById = (req, res, next) => {
  const id = req.params.id;

  User.findByPk(id)
    .then((users) => {
      if (users !== null) {
        response(res, 200, users, true, null, null);
      } else {
        response(res, 404, null, false, null, 'The id does not exist');
      }
    })
    .catch((err) => {
      response(res, 500, null, false, null, 'Internal server error');
    });
};

// update user by ID
const update = (req, res, next) => {
  const data = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    fullname: req.body.fullname,
    picture: req.body.picture,
    bio: req.body.bio,
    updatedAt: new Date(),
    updatedBy: req.body.updatedBy,
    isDeleted: false,
  };

  const id = req.params.id;

  // validation schema
  const schema = {
    username: { type: 'string', min: 5, max: 50, optional: false },
    email: { type: 'email', optional: false },
    password: { type: 'string', min: 5, max: 50, optional: false },
  };

  // validation data
  const validationResult = v.validate(data, schema);

  if (validationResult !== true) {
    // Data validation failed
    response(res, 400, null, false, validationResult, 'Validation failed');
  } else {
    // Data validation success & update user
    User.update(data, { where: { id } })
      .then((result) => {
        response(res, 200, result, true, null, 'Success update user data');
      })
      .catch((err) => {
        response(res, 500, null, false, null, 'Internal server error');
      });
  }
};

// delete user by ID
const destroy = (req, res, next) => {
  const id = req.params.id;

  /** hard delete */
  // User.destroy({ where: { id } })
  //   .then((result) => {
  //     response(res, 200, result, true, null, 'Success delete user data');
  //   })
  //   .catch((err) => {
  //     response(res, 500, null, false, null, 'Internal server error');
  //   });

  /** soft delete */
  const data = {
    isDeleted: true,
    deletedAt: new Date(),
    deleteBy: 1,
  };

  User.update(data, { where: { id: id } })
    .then((result) => {
      response(res, 200, result, true, null, 'Success delete user data');
    })
    .catch((err) => {
      response(res, 500, null, false, null, 'Internal server error');
    });
};

// login user (signin)
const signin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (user) {
        if (user.isDeleted == false) {
          // check password
          bcrypt.compare(password, user.password, function (err, result) {
            if (result) {
              // jwt
              const token = jwt.sign(
                {
                  email: user.email,
                  username: user.username,
                  userId: user.id,
                  exp: Math.floor(Date.now() / 1000) + 60 * 60, //expired in 1 hour
                },
                JWT_SECRET,
                function (err, token) {
                  let data = {
                    token: token,
                  };
                  response(res, 200, data, true, null, 'Success login');
                }
              );
            } else {
              response(res, 401, null, false, null, 'Wrong password');
            }
          });
        } else {
          response(res, 401, null, false, null, 'User has been deleted');
        }
      } else {
        response(res, 401, null, false, null, 'Email not found');
      }
    })
    .catch((err) => {
      response(res, 500, null, false, null, 'Internal server error');
    });
};

module.exports = {
  signup,
  read,
  readById,
  update,
  destroy,
  signin,
};
