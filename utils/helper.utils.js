/**
 *
 * @param {int} res
 * @param {int} status
 * @param {*} data
 * @param {boolean} success
 * @param {*} err
 * @param {string} message
 * @returns
 */
const response = (res, status, data, success, err, message) => {
  let result = {
    success: success || false,
  };

  if (message) result.message = message;
  if (data) result.data = data;
  if (err) result.error = err;
  return res.status(status).json(result);
};

module.exports = {
  response,
};
