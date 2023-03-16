var express = require("express");
var router = express.Router();
const Models = require("./../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const auth = require("../middleware/auth");
const User = Models.User;
const awsFunctions = require("../aws/aws-functions");
dotenv.config();

/* Register users. */
router.post("/", async (req, res, next) => {
  if (!("name" in req.body && "email" in req.body && "password" in req.body)) {
    res.status(400).json({ msg: "Missing required request body" });
    return;
  }
  // return error if email already exists
  const salt = await bcrypt.genSalt(10);
  var usr = {
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, salt),
  };
  // option to add username during registration
  if ("username" in req.body && req.body.username != undefined) {
    usr.username = req.body.username;
  }
  try {
    createdUser = await User.create(usr);
    const { id, name, email } = createdUser;
    res.status(201).json({ id, name, email });
  } catch (err) {
    res.status(500).json({ msg: "Server Error " + err });
  }
});

/* Delete the logged in user. */
// authenticate before deleting
// deleting users also means deleting all their respective s3 images
router.delete("/me", auth, async (req, res, next) => {
  let rowDeleted = await User.destroy({
    where: { id: req.user.id },
    attributes: { exclude: ["password"] },
  });
  const dir = "" + req.user.id + "/";

  await awsFunctions.deleteDirectoryFromS3(dir);
  if (rowDeleted === 1) {
    res.status(200).json({ msg: "User deleted" });
  } else {
    res.status(404).json({ msg: "User does not exist" });
  }
});

/* login users and return JWT. */
router.post("/login", async (req, res, next) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  if (user) {
    const password_valid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (password_valid) {
      token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.SECRET
      );
      res.status(200).json({ token: token });
    } else {
      res.status(400).json({ error: "Password Incorrect" });
    }
  } else {
    res.status(404).json({ error: "User does not exist" });
  }
});

/* Use JWT to get information about the logged in user */
router.get("/me", auth, async (req, res, next) => {
  let user = await User.findOne({
    where: { id: req.user.id },
    attributes: { exclude: ["password"] },
  });
  if (user === null) {
    res.status(404).json({ msg: "User not found" });
  }
  res.status(200).json(user);
});

/* Get a specific user */
router.get("/:id", auth, async (req, res, next) => {
  let user = await User.findOne({
    where: { id: req.params.id },
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  });
  if (user === null) {
    res.status(404).json({ msg: "User not found" });
  }
  res.status(200).json(user);
});

/* Authorized user can add username for themselves post-registration */
router.put("/me", auth, async (req, res, next) => {
  try {
    const foundUser = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ["password"] },
    });

    if (foundUser === null) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    const result = await foundUser.update({ username: req.body.username });
    res.status(200).json(result);
  } catch (err) {
    res.status(409).json({ msg: "Username already exists" });
  }
});

module.exports = router;
