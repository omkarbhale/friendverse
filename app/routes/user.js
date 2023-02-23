const router = require("express").Router();

const userAuth = require("../middlewares/userAuth");
const {
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
	notImplemented,
} = require("../controllers/user");

const multer = require("multer");
const upload = multer({
	dest: "uploads",
	limits: { fileSize: 16777216 /** 16MB */ },
});

router.post(
	"/register",
	upload.fields([{ name: "image", maxCount: 1 }]),
	register
);
router.get("/login", login);

router.get("/profile", userAuth, getCurrentUserProfile);
router.patch(
	"/profile/edit",
	upload.fields([{ name: "image", maxCount: 1 }]),
	userAuth,
	editCurrentProfile
);
router.get("/:id/profile", userAuth, getUserProfile);

router.get("/followers", userAuth, getCurrentUserFollowers);
router.get("/:id/followers", userAuth, getUserFollowers);

router.get("/following", userAuth, getCurrentUserFollowing);
router.get("/:id/following", userAuth, getUserFollowing);

router.get("/posts", userAuth, getCurrentUserPosts);
router.get("/:id/posts", userAuth, getUserPosts);

router.get("/followrequests", userAuth, getFollowRequests);
router.post("/:id/accept", userAuth, acceptFollowRequest);
router.post("/:id/follow", userAuth, followUser);
router.delete("/:id/unfollow", userAuth, unfollowUser);

module.exports = router;
