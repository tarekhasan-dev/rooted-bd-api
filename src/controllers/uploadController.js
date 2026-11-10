
const cloudinary = require("../config/cloudinary");
const { getCollection } = require("../config/db");

// Upload image and save image information to MongoDB
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload!",
      });
    }

    // Determine image type
    const imageType = req.body.imageType || "profile";

    if (!["profile", "cover"].includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image type!",
      });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder:
            imageType === "cover"
              ? "rooted-bd/cover-images"
              : "rooted-bd/profile-images",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Save image information to MongoDB
    const userProfilesCollection = getCollection("userProfiles");

    const imageFields =
      imageType === "cover"
        ? {
            coverImage: result.secure_url,
            coverImagePublicId: result.public_id,
          }
        : {
            image: result.secure_url,
            imagePublicId: result.public_id,
          };

    await userProfilesCollection.updateOne(
      { userId: req.user.id },
      {
        $set: {
          ...imageFields,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Image uploaded and saved successfully!",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        type: imageType,
      },
    });
  } catch (error) {
    console.error("Image Upload Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Image upload failed!",
    });
  }
};

module.exports = {
  uploadImage,
};
