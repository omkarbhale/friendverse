const mongoose = require("mongoose");

const PostSchema = mongoose.Schema(
	{
		user: { type: mongoose.Types.ObjectId, required: true },
		images: [String],
		caption: { type: String },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
