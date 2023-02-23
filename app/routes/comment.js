const express = require("express");
const router = express.Router();

const { deleteComment, notImplemented } = require("../controllers/comment");

router.delete("/:id/delete", deleteComment);

module.exports = router;
