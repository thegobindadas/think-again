import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";


dotenv.config({});

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});



export const uploadMediaToCloudinary = async (filePath) => {
  try {

    const uploadResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(filePath);

    return uploadResponse;

  } catch (error) {
    fs.unlinkSync(filePath);
    console.error(error);
  }
};


export const deleteMediaFromCloudinary = async (publicId) => {
  try {

    const deleteResponse = await cloudinary.uploader.destroy(publicId);


    return deleteResponse;

  } catch (error) {
    console.error(error);
  }
};


export const deleteVideoFromCloudinary = async (publicId) => {
  try {

    const deleteResponse = await cloudinary.uploader.destroy(publicId, { resource_type: "video" });


    return deleteResponse;

  } catch (error) {
    console.error(error);
  }
}