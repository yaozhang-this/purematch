var AWS = require("aws-sdk");
const crypto = require("crypto");
const dotenv = require("dotenv");
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
var s3 = new AWS.S3();
/* Upload individual base64 data to S3 and get urls*/
module.exports = {
  uploadPhotosToS3: async function (user_id, base64) {
    const base64Data = Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = base64.split(";")[0].split("/")[1];

    let uuid = crypto.randomUUID();
    var file = "" + user_id + "/" + uuid + "." + type;
    // call S3 to retrieve upload file to specified bucket
    var uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: file,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64", // required
      ContentType: `image/${type}`, // required. Notice the back ticks
    };

    try {
      const stored = await s3.upload(uploadParams).promise();
      return { status: "success", location: stored.Location };
    } catch (err) {
      return { status: "error", msg: err };
    }
  },

  /* Upload individual base64 data to S3 and get urls*/
  deletePhotosFromS3: async function (url) {
    const split = url.split("/");
    const key = split[3] + "/" + split[4];

    // call S3 to retrieve upload file to specified bucket
    var params = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
      return { status: "success" };
    } catch (err) {
      return { status: "error", msg: err };
    }
  },

  deleteDirectoryFromS3: async function (dir) {
    const listParams = {
      Bucket: process.env.S3_BUCKET,
      Prefix: dir,
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
      Bucket: process.env.S3_BUCKET,
      Delete: { Objects: [] },
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await emptyS3Directory(dir);
  },
};
