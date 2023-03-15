var express = require("express");
var router = express.Router();
const Models = require("./../models");
const dotenv = require("dotenv");
const auth = require("../middleware/auth");
const utilities = require("../utilities/utilities");
const Comment = Models.Comment;
const User = Models.User;
dotenv.config();

/* Post a comment from current user under a specific post */
router.post("/posts/:id", auth, async (req, res, next) => {
  if (!("id" in req.params && "content" in req.body)) {
    res.status(401).json({ msg: "Missing required request body" });
    return;
  }

  var comment = {
    post_id: req.params.id,
    commenter_id: req.user.id,
    content: req.body.content,
  };

  try {
    const created_comment = await Comment.create(comment);
    res.status(201).json(created_comment);
  } catch (err) {
    res.status(404).json({ msg: "Post does not exist" });
  }
});

/* Get all comments from specific post*/
// The post_id can be any posts, not just the current user's
router.get("/posts/:id", auth, async (req, res, next) => {
  const { page, size } = utilities.paginationHandler(
    req.body.page,
    req.body.size
  );

  try {
    let comments = await Comment.findAndCountAll({
      where: { post_id: req.params.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "commenter",
          attributes: {
            exclude: ["id", "password", "createdAt", "updatedAt"],
          },
          required: true,
        },
      ],
      limit: size,
      offset: page * size,
      raw: true,
    });

    var jsonComments = utilities.addDiffTimeToQueryResults(comments.rows);

    res.status(200).json({
      content: jsonComments,
      totalPages: Math.ceil(comments.count / size),
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error: " + err });
  }
});

/* Get a comment by unique comment id*/
// The post_id can be any posts, not just the current user's
router.get("/:id", auth, async (req, res, next) => {
  try {
    let comment = await Comment.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: "commenter",
          attributes: {
            exclude: ["id", "password", "createdAt", "updatedAt"],
          },
          required: true,
        },
      ],
      raw: true,
    });

    if (comment == null) {
      res.status(404).json({ msg: "Comment does not exist" });
      return;
    }
    var jsonComment = utilities.addDiffTimeToQueryResults([comment]);

    res.status(200).json(jsonComment);
  } catch (err) {
    res.status(500).json({ msg: "Server Error: " + err });
  }
});

module.exports = router;
