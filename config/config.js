const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: "postgres",
    host: process.env.DB_HOST,
  },
};
