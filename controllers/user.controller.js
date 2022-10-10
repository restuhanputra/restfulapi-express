const { User } = require('../models');
const Validator = require('fastest-validator');
const v = new Validator();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

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
      User.findOne({ where: { email: req.body.email } })
        .then((user) => {
          if (user) {
            // email available
            res.status(400).json({
              status: 400,
              message: 'Email already exist',
            });
          } else {
            // validation data
            const validationResult = v.validate(data, schema);

            if (validationResult !== true) {
              // Data validation failed
              res.status(400).json({
                status: 400,
                message: 'Validation failed',
                data: validationResult,
              });
            } else {
              // Email not available & Data validation success
              // create user
              User.create(data).then((result) => {
                res
                  .status(200)
                  .json({
                    message: 'User created successfully',
                    data: result,
                  })
                  .catch((err) => {
                    res.status(500).json({
                      message: err.message || 'Registration failed',
                    });
                  });
              });
            }
          }
        })
        .catch((err) => {
          res.status(500).json({
            message: 'Something wrong',
          });
        });
    });
  });
};

// read user
const read = (req, res, next) => {
  /** show all data */
  // User.findAll()
  //   .then((users) => {
  //     res.send(users);
  //   })
  //   .catch((err) => {
  //     res.send(err);
  //   });

  /** show all data except isDelete is true */
  User.findAll({
    where: { isDeleted: false },
  })
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.send(err);
    });
};

// read by ID
const readById = (req, res, next) => {
  // User.findAll({
  //   where: { id: req.params.id },
  // })
  //   .then((users) => {
  //     res.send(users);
  //   })
  //   .catch((err) => {
  //     res.send(err);
  //   });

  const id = req.params.id;
  User.findByPk(id)
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.send(err);
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
    res.status(400).json({
      status: 400,
      message: 'Validation failed',
      data: validationResult,
    });
  } else {
    // Data validation success & update user
    User.update(data, { where: { id } }).then((result) => {
      res
        .status(200)
        .json({
          status: 200,
          message: 'Success update user data',
          data: result,
        })
        .catch((err) => {
          res.status(500).json({
            status: 500,
            message:
              err.message || 'Some error occured while updating the user',
          });
        });
    });
  }
};

// delete user by ID
const destroy = (req, res, next) => {
  const id = req.params.id;

  /** hard delete */
  // User.destroy({ where: { id } })
  //   .then((result) => {
  //     res.status(200).json({
  //       status: 200,
  //       message: 'Success delete user data',
  //       data: result,
  //     });
  //   })
  //   .catch((err) => {
  //     res.status(500).json({
  //       status: 500,
  //       message: err.message || 'Some error occured while deleting the user',
  //     });
  //   });

  /** soft delete */
  const data = {
    isDeleted: true,
    deletedAt: new Date(),
    deleteBy: 1,
  };

  User.update(data, { where: { id: id } })
    .then((result) => {
      res.status(200).json({
        status: 200,
        message: 'Success delete user data',
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 500,
        message: err.message || 'Some error occured while deleting the user',
      });
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
                  res.status(200).json({
                    status: 200,
                    message: 'Success login',
                    token: token,
                  });
                }
              );
            } else {
              res.status(401).json({
                status: 401,
                message: 'Wrong password',
              });
            }
          });
        } else {
          res.status(401).json({
            status: 401,
            message: 'User has been deleted',
          });
        }
      } else {
        res.status(401).json({
          status: 401,
          message: 'Email not found',
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        status: 500,
        message: err.message || 'Some error occured while login',
      });
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
