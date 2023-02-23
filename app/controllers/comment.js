const { StatusCodes } = require("http-status-codes");
const Comment = require("../models/Comment");

const deleteComment = async (req, res, next) => {
	const comment = await Comment.findOneAndDelete({
		_id: req.params.id,
		user: req.user._id,
	});
	if (comment == null) {
		return res.status(StatusCodes.NOT_FOUND).json({
			message: "Post doesn't exist or unauthorized",
		});
	}

	return res.status(StatusCodes.OK).json({
		message: "Post deleted successfully",
	});
};

module.exports = {
	deleteComment,
	notImplemented: (req, res, next) => {
		res.json({ message: "Not implemented" });
	},
};
