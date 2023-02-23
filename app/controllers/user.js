const { StatusCodes } = require("http-status-codes");
const fs = require("fs");

const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");

const { pathToImage } = require("../utils/uploads");

const register = async (req, res, next) => {
	const user = new User({
		username: req.body.username,
		password: req.body.password,
		firstName: req.body.firstName,
	});
	if (req.body.lastName) {
		user.lastName = req.body.lastName;
	}
	if (req.files.image) {
		user.image = req.files.image.filename;
	}
	if (req.body.about) {
		user.about = req.body.about;
	}

	await user.save();
	return res.status(StatusCodes.CREATED).json({
		message: "Registered successfully",
	});
};

const login = async (req, res, next) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username }).select("password");
	const token = await user.login(password);
	return res.status(StatusCodes.OK).json({
		token,
		id: user._id,
	});
};

const getCurrentUserProfile = async (req, res, next) => {
	const user = req.user;
	if (user.image) {
		const base64string = await pathToImage(user.image);
		user.image = base64string;
	}
	return res.status(StatusCodes.OK).json({ user });
};

const editCurrentProfile = async (req, res, next) => {
	const { username, password, oldpassword, firstName, lastName, about } =
		req.body;

	const updatedFields = [];
	if (username) {
		req.user.username = username;
		updatedFields.push("username");
	}
	if (password && oldpassword) {
		const correct = req.user.comparePassword(oldpassword);
		if (correct) {
			req.user.password = password;
			updatedFields.push("password");
		}
	}
	if (req.files.image) {
		fs.unlink(`uploads/${req.user.image}`, () => {});
		req.user.image = req.files.image.filename;
		updatedFields.push("image");
	}
	if (firstName) {
		req.user.firstName = firstName;
		updatedFields.push("firstName");
	}
	if (lastName) {
		req.user.lastName = lastName;
		updatedFields.push("lastName");
	}
	if (about) {
		req.user.about = about;
		updatedFields.push("about");
	}

	return res.status(StatusCodes.OK).json({
		message: "Fields updated",
		updatedFields,
	});
};

const getUserProfile = async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (user == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "User doesn't exist",
		});
	}

	if (user.image) {
		const base64string = await pathToImage(user.image);
		user.image = base64string;
	}

	// const follow = await Follow.findOne({
	// 	follower: req.user._id,
	// 	followed: user._id,
	// });
	// if (follow == null) {
	// 	return res.status(StatusCodes.BAD_REQUEST).json({
	// 		message: "You must follow given user to see their profile",
	// 	});
	// }

	return res.status(StatusCodes.OK).json(user);
};

const getCurrentUserFollowers = async (req, res, next) => {
	const followers = await Follow.find({
		followed: req.user._id,
		accepted: true,
	});
	return res
		.status(followers.length == 0 ? StatusCodes.NOT_FOUND : StatusCodes.OK)
		.json({ followers: followers.map((follow) => follow.follower) });
};

const getUserFollowers = async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (user == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "User doesn't exist",
		});
	}

	const follow = await Follow.findOne({
		follower: req.user._id,
		followed: user._id,
		accepted: true,
	});
	if (follow == null) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "You must follow given user to get their followers",
		});
	}

	const followers = await Follow.find({ followed: user._id });
	return res
		.status(followers.length == 0 ? StatusCodes.NOT_FOUND : StatusCodes.OK)
		.json({ followers: followers.map((follow) => follow.follower) });
};

const getCurrentUserFollowing = async (req, res, next) => {
	const following = await Follow.find({
		follower: req.user._id,
		accepted: true,
	});
	return res
		.status(following.length == 0 ? StatusCodes.NOT_FOUND : StatusCodes.OK)
		.json({ following: following.map((follow) => follow.followed) });
};

const getUserFollowing = async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (user == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "User doesn't exist",
		});
	}

	const follow = await Follow.findOne({
		follower: req.user._id,
		followed: user._id,
		accepted: true,
	});
	if (follow == null) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "You must follow given user to get their followings",
		});
	}

	const following = await Follow.find({ follower: user._id });
	return res
		.status(following.length == 0 ? StatusCodes.NOT_FOUND : StatusCodes.OK)
		.json({ following: following.map((follow) => follow.followed) });
};

const getCurrentUserPosts = async (req, res, next) => {
	const posts = await Post.find({ user: req.user._id });
	return res
		.status(posts.length == 0 ? StatusCodes.NOT_FOUND : StatusCodes.OK)
		.json({ posts: posts.map((post) => post._id) });
};

const getUserPosts = async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (user == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "User doesn't exist",
		});
	}

	const follow = await Follow.findOne({
		follower: req.user._id,
		followed: user._id,
		accepted: true,
	});
	if (follow == null) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "You must follow given user to see their posts",
		});
	}

	const posts = await Post.find({ user: user._id });
	return res
		.status(posts.length == 0 ? StatusCodes.NOT_FOUND : StatusCodes.OK)
		.json({ posts: posts.map((post) => post._id) });
};

const getFollowRequests = async (req, res, next) => {
	const follows = await Follow.find({
		followed: req.user._id,
		accepted: false,
	});

	return res
		.status(follows.length == 0 ? StatusCodes.NOT_FOUND : StatusCodes.OK)
		.json({
			followers: follows.map((follow) => follow.follower),
		});
};

const acceptFollowRequest = async (req, res, next) => {
	const follow = await Follow.findOne({
		follower: req.params.id,
		followed: req.user._id,
	});

	if (follow == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "No follow request exists",
		});
	}

	if (follow.accepted) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "Request already accepted",
		});
	}

	follow.accepted = true;
	await follow.save();
	return res.status(StatusCodes.OK).json({
		message: "Follow request accepted successfully",
	});
};

const followUser = async (req, res, next) => {
	const existingFollow = await Follow.findOne({
		follower: req.user._id,
		followed: req.params.id,
	});

	if (existingFollow) {
		if (existingFollow.accepted) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: "User already follows",
			});
		}
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: "Follow request already pending",
		});
	}

	const followed = await User.findById(req.params.id);
	if (followed == null) {
		return res.status(StatusCodes.NOT_FOUND).json({
			message: "Cannot follow someone who doesn't exist",
		});
	}

	const follow = new Follow({
		follower: req.user._id,
		followed: req.params.id,
	});

	await follow.save();
	return res.status(StatusCodes.CREATED).json({
		message: "Follow request sent successfully",
	});
};

const unfollowUser = async (req, res, next) => {
	const follow = await Follow.findOneAndDelete({
		follower: req.user._id,
		followed: req.params.id,
	});

	if (follow == null) {
		return res.status(StatusCodes.CONFLICT).json({
			message: "Cannot delete non existent follow",
		});
	}

	if (follow.accepted) {
		return res.status(StatusCodes.OK).json({
			message: "Unfollowed successfully",
		});
	}
	return res.status(StatusCodes.OK).json({
		message: "Removed follow request successfully",
	});
};

module.exports = {
	register,
	login,
	getCurrentUserProfile,
	editCurrentProfile,
	getUserProfile,
	getCurrentUserFollowers,
	getUserFollowers,
	getCurrentUserFollowing,
	getUserFollowing,
	getCurrentUserPosts,
	getUserPosts,
	getFollowRequests,
	acceptFollowRequest,
	followUser,
	unfollowUser,
	notImplemented: (req, res, next) => {
		res.json({ message: "Not implemented" });
	},
};
