require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const connectDB = require("./app/db/connect");
const bodyParser = require("body-parser");

// middlewares
app.use(bodyParser.json());

// routers
const userRouter = require("./app/routes/user");
const postRouter = require("./app/routes/post");
const commentRouter = require("./app/routes/comment");

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);

// Error handling
app.use((err, req, res, next) => {
	res.status(500).json({
		message: err.message,
	});
});

const run = async () => {
	await connectDB();
	app.listen(3000, () => {
		console.log("Listening on port 3000");
	});
};

run();
