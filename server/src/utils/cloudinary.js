import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloud = async (localFilePath) => {
  try {

    if (!localFilePath) return null;

    const uploadedVideo = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Uploaded to Cloudinary:", uploadedVideo.url);
    fs.unlinkSync(localFilePath);
    return uploadedVideo;
  }
   catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    fs.unlinkSync(localFilePath);
    return null;
  }
};
export { uploadOnCloud };
