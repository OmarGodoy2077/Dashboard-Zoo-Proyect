const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
 return await bcrypt.hash(password, saltRounds);
};

module.exports = {
  hashPassword
};