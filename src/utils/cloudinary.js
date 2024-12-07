import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { ApiError } from './ApiError.js';
import { log } from 'console';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
        folder: 'your_folder_name' 
    })
    //file has been uploaded successfull
    console.log("file is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath);
    return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)  // remove the locally saved temporary file as the upload operation got failed 
        return null;
    }
}



const deleteFromCloudinary = async (imageUrl) => {

    console.log(imageUrl)
   try {
        if(!imageUrl) {
            throw new ApiError(400, "Image URL is required for deletion");
        }

        const publicId = imageUrl.split('/').pop().split('.')[0];

        const response = await cloudinary.uploader.destroy(publicId);

        if (response.result !== 'ok') {
            throw new ApiError(500, "Failed to delete image from Cloudinary");
        }

        console.log("Image successfully deleted from Cloudinary:", publicId);
        return response;

   } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        throw new ApiError(500, "Error deleting image from Cloudinary");
   }
}

export {uploadOnCloudinary,deleteFromCloudinary}

