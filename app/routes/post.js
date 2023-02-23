const router = require("express").Router();

const userAuth = require("../middlewares/userAuth");
const {
	makePost,
	getPost,
	editPost,
	deletePost,
	getComments,
	makeComment,
	notImplemented,
} = require("../controllers/post");

const multer = require("multer");
const upload = multer({
	dest: "uploads",
	limits: { fileSize: 16777216 /** 16MB */ },
});

router.post("/", userAuth, upload.array("images", 5), makePost);

router.get("/:id", userAuth, getPost);
router.patch("/:id/edit", userAuth, editPost);
router.delete("/:id/delete", userAuth, deletePost);

router.get("/:id/comments", userAuth, getComments);
router.post("/:id/comment", userAuth, makeComment);

module.exports = router;
