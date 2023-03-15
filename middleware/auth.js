const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

/* Middleware to authenticate users with JWT. */
module.exports = (req, res, next) => {
  try {
    let token = req.headers["authorization"].split(" ")[1]; // use split to get last index
    let decoded = jwt.verify(token, process.env.SECRET); // verify with secret key stored in env
    req.user = decoded; // pass user to next
    next(); //
  } catch (err) {
    res.status(401).json({ msg: "Could not Authenticate" });
  }
};
