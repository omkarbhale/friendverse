const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema({
	username: { type: String, required: true },
	password: { type: String, required: true, select: false },
	image: { type: String },
	firstName: { type: String, required: true },
	lastName: { type: String },
	about: { type: String },
});

UserSchema.pre("save", async function (next) {
	// only hash the password if it has been modified (or is new)
	if (!this.isModified("password")) return next();

	const salt = await bcrypt.genSalt();
	const hashed = await bcrypt.hash(this.password, salt);
	this.password = hashed;

	return next();
});

UserSchema.methods.login = async function (password) {
	const correct = await this.comparePassword(password);
	if (!correct) {
		throw new Error("Incorrect password");
	}

	const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET);
	return token;
};

UserSchema.methods.comparePassword = async function (password) {
	const correct = await bcrypt.compare(password, this.password);
	return correct;
};

module.exports = mongoose.model("User", UserSchema);
