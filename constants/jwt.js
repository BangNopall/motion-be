const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET;

const generateToken = (data) => {
	return jwt.sign(data, getJwtSecret(), { expiresIn: 7200 });
};

const verifyToken = (token) => {
	return jwt.verify(token, getJwtSecret());
};

module.exports = {
	generateToken,
	verifyToken,
};
