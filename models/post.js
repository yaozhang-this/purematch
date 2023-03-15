"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      });
    }
  }
  Post.init(
    {
      user_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      photos: DataTypes.ARRAY(DataTypes.TEXT),
    },
    {
      sequelize,
      modelName: "Post",
    }
  );
  return Post;
};
