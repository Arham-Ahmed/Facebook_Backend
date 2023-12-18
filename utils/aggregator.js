const userModel = require("../Models/user");
const aggregator = async (userId) => {
  return await userModel.aggregate([
    { $match: { _id: userId } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "owner",
        as: "post",
        // pipeline: [{ $match: { isDeleted: { $eq: null } } }],
      },
    },
    {
      $lookup: {
        from: "media",
        localField: "_id",
        foreignField: "owner",
        as: "media",
      },
    },
    {
      $lookup: {
        from: "links",
        localField: "_id",
        foreignField: "owner",
        as: "socialLinks",
      },
    },
    {
      $lookup: {
        from: "media",
        localField: "post._id",
        foreignField: "post",
        as: "postMedia",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        createdAt: 1,
        updatedAt: 1,
        about: {
          livesIn: "$about.livesIn",
          bio: "$about.bio",
          socialLinks: "$socialLinks",
        },
        profileImages: {
          $filter: {
            input: "$media",
            cond: { $eq: ["$$this.type", "profileImage"] },
          },
        },
        coverImages: {
          $filter: {
            input: "$media",
            cond: { $eq: ["$$this.type", "coverImage"] },
          },
        },
        posts: {
          $map: {
            input: "$post",
            as: "p",
            in: {
              post: "$$p",
              postImages: "$postMedia",
            },
          },
        },
      },
    },
    {
      $unset: [
        "profileImages.owner",
        "profileImages.type",
        "profileImages._id",
        "profileImages.createdAt",
        "profileImages.updatedAt",
        "profileImages.__v",
        //
        "about.socialLinks.owner",
        "about.socialLinks.type",
        "about.socialLinks._id",
        "about.socialLinks.createdAt",
        "about.socialLinks.updatedAt",
        "about.socialLinks.__v",
        //
        "posts.post.owner",
        "posts.post.type",
        "posts.post.__v",
        // "posts.post.isDeleted",
        "posts.post.updatedAt",
        //
        "coverImages.owner",
        "coverImages.type",
        "coverImages._id",
        "coverImages.createdAt",
        "coverImages.updatedAt",
        "coverImages.__v",
        //
        "posts.postImages.post",
        "posts.postImages.type",
        "posts.postImages._id",
        "posts.postImages.createdAt",
        "posts.postImages.updatedAt",
        "posts.postImages.__v",
      ],
    },
  ]);
};

module.exports = aggregator;
