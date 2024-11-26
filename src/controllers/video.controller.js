import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1, // Default to first page
        limit = 10, // Default to 10 videos per page
        query = "", // Default to no search
        sortBy = "createdAt", // Default to sorting by creation date
        sortType = "desc", // Default to descending order
        userId, // Optional user ID filter
    } = req.query;

    try {
        // Parse query parameters
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const sortOrder = sortType === "asc" ? 1 : -1;

        // Build MongoDB aggregation pipeline
        const pipeline = [];

        // Filter by text search in title or description
        if (query) {
            pipeline.push({
                $match: {
                    $or: [
                        { title: { $regex: query, $options: "i" } }, // Case-insensitive title search
                        { description: { $regex: query, $options: "i" } }, // Case-insensitive description search
                    ],
                },
            });
        }

        // Filter by user ID (if provided)
        if (userId) {
            pipeline.push({
                $match: { owner: userId },
            });
        }

        // Add lookup to join user details
        pipeline.push({
            $lookup: {
                from: "users", // Collection name for users
                localField: "owner", // Field in videos to join on
                foreignField: "_id", // Field in users to match with
                as: "details", // Output field for user details
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            avatar: 1,
                            username: 1,
                        },
                    },
                ],
            },
        });

        // Flatten user details to a single object
        pipeline.push({
            $addFields: {
                details: { $first: "$details" },
            },
        });

        // Add sorting
        pipeline.push({
            $sort: { [sortBy]: sortOrder },
        });

        // Pagination (skip and limit)
        pipeline.push({
            $skip: (pageNumber - 1) * limitNumber,
        });
        pipeline.push({
            $limit: limitNumber,
        });

        // Get total video count for pagination metadata
        const totalVideos = await Video.countDocuments(
            query
                ? {
                      $or: [
                          { title: { $regex: query, $options: "i" } },
                          { description: { $regex: query, $options: "i" } },
                      ],
                  }
                : {}
        );

        // Execute aggregation pipeline
        const videos = await Video.aggregate(pipeline);

        // Response with paginated results
        res.status(200).json({
            success: true,
            message: "Videos fetched successfully",
            data: videos,
            pagination: {
                total: totalVideos,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(totalVideos / limitNumber),
            },
        });
    } catch (error) {
        throw new ApiError(500, "Error fetching videos", error.message);
    }
});


const publishAVideo = asyncHandler(async (req, res) => {
    // const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    const {title, description} = req.body
    

    try {
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path
        const videoFileLocalPath = req.files?.videoFile[0]?.path
    
        if(
            [title,description,thumbnailLocalPath,videoFileLocalPath].some(
                (field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All publishAVideo field are required!");
        }
    
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    
        if(!thumbnail) {
            throw new ApiError(400, "Thumbnail link is required")
        }
    
        if (!videoFile) {
            throw new ApiError(400, "VideoFile link is required");
        }
    
        const video = await Video.create({
            videoFile: videoFile.secure_url,
            thumbnail: thumbnail.secure_url,
            title,
            description,
            duration: videoFile.duration,
            isPublished: true,
            owner: req.user?._id,
        });
    
        if(!video) {
            throw new ApiError(500, "Something went wrong while uploading the video.")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(200, video,"Video published successfully"))
    } catch (error) {
        throw new ApiError(500, 'Error uploading video to cloudinary', error.message)
    }
})

const   getVideoById = asyncHandler(async (req, res) => {
    // const { videoId } = req.params
    //TODO: get video by id

    const { videoId } = req.params

   try {
 
     if(!isValidObjectId(videoId)) {
         throw new ApiError(400, "Invalid VideoID")
     }
 
     const video = await Video.findById(videoId)
 
     if(!video) {
         throw new ApiError(400, "Failed to get Video details")
     }
 
     return res
     .status(200)
     .json(
         new ApiResponse(200, video , "Video details fetched successfully")
     )
   } catch (error) {
        throw new ApiError(500, 'Error video get details failed', error.message)
   }
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid VideoID.");
    }
    const thumbnailLocalPath = req.file?.path;

    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400, "At lease one field is required.");
    }

    let thumbnail

    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!thumbnail.secure_url) {
            throw new ApiError(
                400,
                "Error while updating thumbnail in cloudinary."
            );
        }

        thumbnail = thumbnail.secure_url  // Save only the URL
    }

    const responce = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail, 
            },
        },
        { new: true }
    );

    if (!responce) {
        throw new ApiError(401, "Video details not found.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, responce, "Video details updated succesfully.")
        );

})

const deleteVideo = asyncHandler(async (req, res) => {
    // const { videoId } = req.params
    //TODO: delete video

    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(402, "Invalid VideoId")
    }

    const deleteResponce = await Video.deleteOne({
        _id: mongoose.Types.ObjectId(videoId)
    })

    if (!deleteResponce) {
        throw new ApiError(400, "Error while deteing video from db");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deleteResponce, "Video deleted succesfully.")
    );d

})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!videoId) {
        throw new ApiError(400, "Video ID is required.");
    }

    // Find the video by ID
    const videotoggle = await Video.findById(videoId);

    if (!videotoggle) {
        throw new ApiError(404, "Video not found.");
    }

    // Toggle the `ispublished` status
    videotoggle.ispublished = !videotoggle.ispublished;

    // Save the changes
    await videotoggle.save();

    // Respond with updated video
    return res.status(200).json({
        statusCode: 200,
        data: videotoggle,
        message: "Published toggled successfully",
        success: true,
    });
});

const incrementViewCount = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    try {
        // Find the video by ID and increment views atomically
        const video = await Video.findByIdAndUpdate(
            videoId,
            { $inc: { views: 1 } }, // Increment the views by 1
            { new: true } // Return the updated document
        );

        // If the video is not found
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Return the updated video with the new view count
        return res.status(200).json(
            new ApiResponse(200, video, "View count incremented successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Failed to increment view count", error.message);
    }
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementViewCount
}