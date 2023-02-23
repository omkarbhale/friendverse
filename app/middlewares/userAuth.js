const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
	const token = req.headers["x-access-token"];
	const payload = jwt.verify(token, process.env.JWT_SECRET);
	const userId = payload.id;
	req.user = await User.findById(userId);
	if (req.user == null) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: "Not authorized",
		});
	}
	next();
};

module.exports = userAuth;
