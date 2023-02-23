const mongoose = require("mongoose");

// database init
const connect = async () => {
	mongoose.set("strictQuery", false);
	mongoose.connection.on("disconnected", () => {
		console.log("MongoDB Disonnected!");
	});
	mongoose.connection.on("error", (err) => {
		console.log(`MongoDB error: ${err.message}`);
	});
	return new Promise((res, rej) => {
		mongoose.connect(process.env.MONGO_URL, () => {
			console.log("MongoDB Connected!");
			res();
		});
	});
};

module.exports = connect;
