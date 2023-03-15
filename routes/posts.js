var express = require("express");
var router = express.Router();
const Models = require("./../models");
const auth = require("../middleware/auth");
const Post = Models.Post;
const awsFunctions = require("../aws/aws-functions");
const utilities = require("../utilities/utilities");

const maxPhotos = 5; // constant to set max number of photos
// since postgresql does not set limit to array length
// we should set this constraints on server side
// this also allows us to change photo limit easily

/* Get all posts from every users. */
router.get("/", auth, async (req, res, next) => {
  try {
    var posts = await Post.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit: size,
      offset: page * size,
      raw: true,
    });

    var jsonPosts = utilities.addDiffTimeToQueryResults(posts.rows);

    res.status(200).json(jsonPosts);
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
      limit: size,
      offset: page * size,
      raw: true,
    });
    var jsonPosts = utilities.addDiffTimeToQueryResults(posts.rows);
    res.status(200).json(jsonPosts);
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
    posts = utilities.addDiffTimeToQueryResults(posts);
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

/* edit a specific post of current user. */
// update whatever fields that changed(sent)
router.put("/users/me/:id", auth, async (req, res, next) => {
  var editedPost = {};
  for (k in req.body) {
    if (k == "title") {
      editedPost.title = req.body.title;
    }
    if (k == "description") {
      editedPost["description"] = req.body.description;
    }
    if (k == "photos") {
      editedPost["photos"] = req.body.photos;
    }
  }
  try {
    //model update: only update a unique single row
    // only the author of the post can edit their posts
    const target = await Post.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });
    if (target === null) {
      res.status(404).json({ msg: "Post not found" });
      return;
    }
    if ("photos" in req.body) {
      // detect maximum photos length
      if (req.body.photos.length > maxPhotos) {
        res.status(401).json({ msg: "Exceeded photos limits of " + maxPhotos });
      }
      // delete all the current image files and reupload the new photos
      for (photoURL of target.dataValues.photos) {
        const deleteResult = await awsFunctions.deletePhotosFromS3(photoURL);
      }
      // uplaod new photos
      var urlLists = [];
      for (base64 of req.body.photos) {
        const uploadResult = await awsFunctions.uploadPhotosToS3(
          req.user.id,
          base64
        );
        if (uploadResult.status == "success") {
          urlLists.push(uploadResult.location);
        } else {
          console.log(uploadResult); // return error if any of the images failed
        }
      }
      editedPost["photos"] = urlLists;
    }
    const result = await target.update(editedPost);
    res.status(200).json(result);
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
  if (req.body.photos.length > maxPhotos) {
    res.status(400).json({ msg: "Exceeded photos limits of " + maxPhotos });
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
