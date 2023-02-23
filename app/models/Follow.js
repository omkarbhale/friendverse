const mongoose = require("mongoose");

const FollowSchema = mongoose.Schema(
	{
		follower: { type: mongoose.Types.ObjectId, ref: "User" },
		followed: { type: mongoose.Types.ObjectId, ref: "User" },
		accepted: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Follow", FollowSchema);
