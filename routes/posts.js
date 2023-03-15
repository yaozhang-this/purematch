var express = require("express");
var router = express.Router();
const Models = require("./../models");
const auth = require("../middleware/auth");
const Post = Models.Post;
const awsFunctions = require("../aws/aws-functions");

/* Get all posts from every users. */
router.get("/", auth, async (req, res, next) => {
  try {
    var posts = await Post.findAndCountAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    res.status(200).json(posts.rows);
  } catch (err) {
    res.status(500).json({ msg: "Server Error: " + err });
  }
});

/* Get all posts from the current user. */
router.get("/users/me", auth, async (req, res, next) => {
  try {
    var posts = await Post.findAndCountAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    res.status(200).json(posts.rows);
  } catch (err) {
    res.status(500).json({ msg: "Server Error: " + err });
  }
});

/* Get a specific post by post id. */
router.get("/:id", auth, async (req, res, next) => {
  try {
    var posts = await Post.findOne({
      where: { id: req.params.id },
      raw: true,
    });
    if (posts === null) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Server Error: " + err });
  }
});

/* Delete a specific post of current user. */
// need to clear s3 as well
router.delete("/users/me/:id", auth, async (req, res, next) => {
  try {
    // find the post first and delete its images from s3
    // then delete from database
    var postToDelete = await Post.findOne({
      where: { user_id: req.user.id, id: req.params.id },
    });

    for (photoURL of postToDelete.dataValues.photos) {
      const deleteResult = await awsFunctions.deletePhotosFromS3(photoURL);
    }
    var rowDeleted = await postToDelete.destroy();
    res.status(200).json({ msg: "Post deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error: " + err });
  }
});

/* Create a new post for the current user. */
//(author), title, description and a photo(blob).
// workflow:
// 1. collect image data and upload image3 to S3
// 2. store images s3 urls to database
router.post("/", auth, async (req, res, next) => {
  if (
    !("title" in req.body && "description" in req.body && "photos" in req.body)
  ) {
    res.status(400).json({ msg: "Missing required request body" });
    return;
  }

  // get post photos in base64 encoded data
  // upload base64 data images to s3 with UUID filenames
  // save uplaoded url to database
  var urlLists = [];
  for (base64 of req.body.photos) {
    uploadResult = await awsFunctions.uploadPhotosToS3(req.user.id, base64);
    if (uploadResult.status == "success") {
      urlLists.push(uploadResult.location);
    } else {
      console.log(uploadResult);
    }
  }
  var post = {
    user_id: req.user.id,
    title: req.body.title,
    description: req.body.description,
    photos: urlLists,
  };
  try {
    created_post = await Post.create(post);
    res.status(201).json(created_post);
  } catch (err) {
    res.status(500).json({ msg: "Server Error: " + err });
  }
});

module.exports = router;
