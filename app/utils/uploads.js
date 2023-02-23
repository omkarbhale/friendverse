const fs = require("fs");

const pathToImage = async (filename) => {
	return new Promise((res, rej) => {
		try {
			const base64String = fs.readFileSync(
				`./uploads/${filename}`,
				"base64"
			);
			res(base64String);
		} catch (err) {
			rej(err);
		}
	});
};

module.exports = {
	pathToImage,
};
