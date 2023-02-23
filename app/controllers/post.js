const Post = require("../models/Post");
const Follow = require("../models/Follow");
const Comment = require("../models/Comment");

const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const { pathToImage } = require("../utils/uploads");

const makePost = async (req, res, next) => {
	if (!req.files) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "No images provided",
		});
	}
	const post = new Post({
		user: req.user._id,
		images: req.files.map((file) => file.filename),
	});
	if (req.body.caption) {
		post["caption"] = req.body.caption;
	}

	await post.save();
	return res.status(StatusCodes.OK).json({
		message: "Post created",
	});
};

const getPost = async (req, res, next) => {
	const post = await Post.findById(req.params.id);
	if (post == null) {
		return res.status(StatusCodes.NOT_FOUND).json({
			message: "Post doesn't exist",
		});
	}

	const follow = await Follow.findOne({
		follower: req.user._id,
		followed: post.user,
		accepted: true,
	});
	if (post.user.toString() != req.user._id && follow == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "You need to follow the person to veiw their post",
		});
	}

	post.images = await Promise.all(
		post.images.map((image) => pathToImage(image))
	);

	return res.status(StatusCodes.OK).json({
		post,
	});
};

const editPost = async (req, res, next) => {
	const { caption } = req.body;
	const post = await Post.findOne({
		_id: req.params.id,
		user: req.user._id,
	});

	if (post == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "Post doesn't exist or you are unauthorized",
		});
	}

	if (caption) {
		post.caption = caption;
	} else {
		delete post.caption;
	}
	await post.save();
	return res.status(StatusCodes.OK).json({
		message: "Post updated successfully",
	});
};

const deletePost = async (req, res, next) => {
	const post = await Post.findOneAndDelete({
		_id: req.params.id,
		user: req.user._id,
	});
	if (post == null) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: "Not authorized or post doesn't exist",
		});
	}
	post.images.forEach((image) => fs.unlink(`uploads/${image}`, () => {}));
	return res.status(StatusCodes.OK).json({
		message: "Post deleted",
	});
};

const getComments = async (req, res, next) => {
	const post = await Post.findOne({
		_id: req.params.id,
	});

	if (post == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "Post doesn't exist",
		});
	}

	const follow = await Follow.findOne({
		follower: req.user._id,
		followed: post.user,
		accepted: true,
	});
	if (follow == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "You must follow the author of post",
		});
	}

	const comments = await Comment.find({ post: post._id }).select("-post");
	return res.status(StatusCodes.OK).json({
		comments,
	});
};

const makeComment = async (req, res, next) => {
	const { text } = req.body;
	if (!text) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Cannot have empty text as comment",
		});
	}

	const post = await Post.findById(req.params.id);
	if (post == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "Post doesn't exist",
		});
	}

	const follow = await Follow.findOne({
		follower: req.user._id,
		followed: post.user,
		accepted: true,
	});
	if (follow == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "You must follow post's author to make comment",
		});
	}

	const comment = new Comment({
		user: req.user._id,
		post: post._id,
		text,
	});
	await comment.save();
	return res.status(StatusCodes.CREATED).json({
		message: "Comment made successfully",
	});
};

module.exports = {
	makePost,
	getPost,
	editPost,
	deletePost,
	getComments,
	makeComment,
	notImplemented: (req, res, next) => {
		res.json({ message: "Not implemented" });
	},
};
