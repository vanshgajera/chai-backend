import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";


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

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if(!localFilePath) return null
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       // Add any necessary options like folder, public_id, etc.
//        resource_type: "auto",
//        folder: 'your_folder_name' // Replace with your desired folder
//     });
//     fs.unlinkSync(localFilePath);
//     // return result.secure_url;
//     return response;
    
//   } catch (error) {
//     console.error("Cloudinary upload error:", error);
//     fs.unlinkSync(localFilePath); // Ensure file cleanup
//     throw new Error('Cloudinary upload failed'); // Handle error appropriately
//   }
// };

export {uploadOnCloudinary}

