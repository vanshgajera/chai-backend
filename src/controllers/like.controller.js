import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// const toggleLike = async (Model, resourceID, userID) => {

//     if(!isValidObjectId(resourceID) || !isValidObjectId(userID)) {
//         throw new ApiError("Invalid  ResourceID or UserID")
//     }

//     const model = Model.modelName;

//     const isLiked = await Like.findOne({
//         [model.toLowerCase()]: resourceID,
//         LikedBy: userID,
//     });

//     let responce;
//     try {
//         if(!isLiked){
//             responce = await Like.create({
//                 [model.toLowerCase()]: resourceID,
//                 LikedBy: userID,
//             })
//         }else{
//             responce = await Like.deleteOne({
//                 [model.toLowerCase()]: resourceID,
//                 LikedBy: userID,
//             });
//         }
//     } catch (error) {
//         throw new ApiError(
//             500,
//             error?.message || "Something went wrong in ToggleLike"
//         )
//     }

//     const totalLikes = await Like.countDocuments({
//         [model.toLowerCase()]: resourceID
//     })

//     return { responce, isLiked, totalLikes }
// }

// const toggleVideoLike = asyncHandler(async (req, res) => {
//     // const {videoId} = req.params
//     //TODO: toggle like on video

//     const { videoId } = req.params
    
//     const { isLiked , totalLikes} = await toggleLike(
//         Video,
//         videoId,
//         req.user?._id
//     )

//     return res
//     .status(201)
//     .json(
//         new ApiResponse
//         (200,
//              { totalLikes },
//               !isLiked ? "Liked Successfully"
//               : "Liked removed Successfully"
//         )
//     )
// })


// const toggleVideoLike = asyncHandler(async (req, res) => {
//     const { videoId } = req.params;
//     const userId = req.user._id; // Assuming the logged-in user's ID is in req.user

//     // Validate the video ID
//     if (!mongoose.Types.ObjectId.isValid(videoId)) {
//         throw new ApiError(400, "Invalid Video ID");
//     }

//     try {
//         // Find the video to ensure it exists
//         const video = await Video.findById(videoId);
//         if (!video) {
//             throw new ApiError(404, "Video not found");
//         }

//         // Check if the user has already liked the video
//         const existingLike = await Like.findOne({ video: videoId, user: userId });

//         if (existingLike) {
//             // If the user has already liked the video, remove the like
//             await existingLike.deleteOne();

//             // Update the like count
//             video.likesCount -= 1;
//             await video.save();

//             return res.status(200).json(
//                 new ApiResponse(200, {
//                     totalLikes: video.likesCount,
//                 }, "Like removed successfully")
//             );
//         } else {
//             // If the user hasn't liked the video, create a new like
//             await Like.create({ video: videoId, user: userId });

//             // Update the like count
//             video.likesCount += 1;
//             await video.save();

//             return res.status(201).json(
//                 new ApiResponse(201, {
//                     totalLikes: video.likesCount,
//                 }, "Liked successfully")
//             );
//         }
//     } catch (error) {
//         throw new ApiError(500, error.message || "Error toggling video like");
//     }
// });


// const toggleVideoLike = asyncHandler(async (req, res) => {
//     const { videoId } = req.params;
//     const userId = req.user._id; // Assuming the logged-in user's ID is in req.user

//     // Validate the video ID
//     if (!mongoose.Types.ObjectId.isValid(videoId)) {
//         throw new ApiError(400, "Invalid Video ID");
//     }

//     try {
//         // Check if the user has already liked the video
//         const existingLike = await Like.findOne({ video: videoId, user: userId });

//         if (existingLike) {
//             // If the user has already liked the video, remove the like
//             await existingLike.deleteOne();

//             // Decrement the likesCount in the Video model
//             const updatedVideo = await Video.findByIdAndUpdate(
//                 videoId,
//                 { $inc: { likesCount: -1 } }, // Decrement likesCount by 1 when removing a like
//                 { new: true } // Return the updated video document
//             );

//             return res.status(200).json(
//                 new ApiResponse(200, {
//                     totalLikes: updatedVideo.likesCount,
//                 }, "Like removed successfully")
//             );
//         } else {
//             // If the user hasn't liked the video, add a new like
//             await Like.create({ video: videoId, user: userId });

//             // Increment the likesCount in the Video model
//             const updatedVideo = await Video.findByIdAndUpdate(
//                 videoId,
//                 { $inc: { likesCount: 1 } }, // Increment likesCount by 1 when adding a like
//                 { new: true } // Return the updated video document
//             );

//             return res.status(201).json(
//                 new ApiResponse(201, {
//                     totalLikes: updatedVideo.likesCount,
//                 }, "Liked successfully")
//             );
//         }
//     } catch (error) {
//         throw new ApiError(500, error.message || "Error toggling video like");
//     }
// });

// const toggleVideoLike = asyncHandler(async (req, res) => {
//     const { videoId } = req.params;
//     const userId = req.user._id; // Assuming the logged-in user's ID is in req.user

//     // Validate the video ID
//     if (!mongoose.Types.ObjectId.isValid(videoId)) {
//         throw new ApiError(400, "Invalid Video ID");
//     }

//     try {
//         // Check if the user has already liked the video
//         const existingLike = await Like.findOne({ video: videoId, user: userId });

//         if (existingLike) {
//             // If the user has already liked the video, remove the like
//             await existingLike.deleteOne();

//             // Decrement the likesCount in the Video model
//             const updatedVideo = await Video.findByIdAndUpdate(
//                 videoId,
//                 { $inc: { likesCount: -1 } }, // Only decrement likesCount by 1 when removing a like
//                 { new: true } // Return the updated video document
//             );

//             return res.status(200).json(
//                 new ApiResponse(200, {
//                     totalLikes: updatedVideo.likesCount,
//                 }, "Like removed successfully")
//             );
//         } else {
//             // If the user hasn't liked the video, do not increment likesCount (you can return a message saying "Already liked" or similar)
//             return res.status(400).json(
//                 new ApiResponse(400, {}, "You have already liked this video")
//             );
//         }
//     } catch (error) {
//         throw new ApiError(500, error.message || "Error toggling video like");
//     }
// });

// const toggleVideoLike = asyncHandler(async (req, res) => {
//     const { videoId } = req.params;
//     const userId = req.user._id; // Assuming the logged-in user's ID is in req.user

//     // Validate the video ID
//     if (!mongoose.Types.ObjectId.isValid(videoId)) {
//         throw new ApiError(400, "Invalid Video ID");
//     }

//     try {
//         // Check if the user has already liked the video
//         const existingLike = await Like.findOne({ video: videoId, user: userId });

//         if (existingLike) {
//             // If the user has already liked the video, remove the like
//             await existingLike.deleteOne();

//             // Decrement the likesCount in the Video model
//             const updatedVideo = await Video.findByIdAndUpdate(
//                 videoId,
//                 { $inc: { likesCount: -1 } }, // Decrement likesCount by 1
//                 { new: true } // Return the updated video document
//             );

//             return res.status(200).json(
//                 new ApiResponse(200, {
//                     totalLikes: updatedVideo.likesCount,
//                 }, "Like removed successfully")
//             );
//         } else {
//             // If the user hasn't liked the video, add a new like
//             await Like.create({ video: videoId, user: userId });

//             // Increment the likesCount in the Video model
//             const updatedVideo = await Video.findByIdAndUpdate(
//                 videoId,
//                 { $inc: { likesCount: 1 } }, // Increment likesCount by 1
//                 { new: true } // Return the updated video document
//             );

//             return res.status(201).json(
//                 new ApiResponse(201, {
//                     totalLikes: updatedVideo.likesCount,
//                 }, "Liked successfully")
//             );
//         }
//     } catch (error) {
//         throw new ApiError(500, error.message || "Error toggling video like");
//     }
// });


// const toggleCommentLike = asyncHandler(async (req, res) => {
//     // // const {commentId} = req.params
//     // //TODO: toggle like on comment

//     // const { commentId } = req.params

//     // const { responce, isLiked, totalLikes} = await toggleLike(
//     //     Comment,
//     //     commentId,
//     //     req.user?._id
//     // )
    

//     // return res
//     // .status(201)
//     // .json(
//     //     new ApiResponse(
//     //         200,
//     //         {totalLikes},
//     //         isLiked ? "Liked Successfully"
//     //         : "Liked removed Successfully"
//     //      )
//     // )

// })

// const toggleTweetLike = asyncHandler(async (req, res) => {
//     // // const {tweetId} = req.params
//     // //TODO: toggle like on tweet

//     // const { tweetId } = req.params

//     // const { responce, isLiked, totalLikes } = await toggleLike(
//     //     Tweet,
//     //     tweetId,
//     //     req.user?._id
//     // )

//     // return res
//     // .status(201)
//     // .json(
//     //     new ApiResponse(
//     //         200,
//     //         {responce},
//     //         { totalLikes },
//     //         !isLiked
//     //                 ? "Liked Successfully"
//     //                 : "Liked removed Successfully"
//     //     )
//     // )
// })

// const getLikedVideos = asyncHandler(async (req, res) => {
//     // //TODO: get all liked videos

//     // const userID = req.user?._id

//     // if(!isValidObjectId(userID)) {
//     //     throw new ApiError(401, "Invalid userID")
//     // }

//     // const likedVideo = await Like.aggregate([
//     //     {
//     //         $match: {
//     //             $and: [
//     //                 {LikedBy: new mongoose.Types.ObjectId(`${userID}`)},
//     //                 {video: {$exists: true}}
//     //             ]
//     //         }
//     //     },
//     //     {
//     //         $lookup: {
//     //             from: "videos",
//     //             localField: "video",
//     //             foreignField: "_id",
//     //             as: "video",
//     //             pipeline: [
//     //                 {
//     //                     $lookup: {
//     //                         from: "users",
//     //                         localField: "owner",
//     //                         foreignField: "_id",
//     //                         as: "owner",
//     //                         pipeline: [
//     //                             {
//     //                                 $project: {
//     //                                     fullName: 1,
//     //                                     username: 1,
//     //                                     avatar: 1,
//     //                                 }
//     //                             }
//     //                         ]
//     //                     }
//     //                 },
//     //                 {
//     //                     $addFields: {
//     //                         owner: {
//     //                             $first: "$owner",
//     //                         }
//     //                     }
//     //                 }
//     //             ]
//     //         }
//     //     },
//     //     {
//     //         $addFields: {
//     //             details: {
//     //                 $first: "$video"
//     //             }
//     //         }
//     //     }
//     // ]);

//     // return res
//     // .status(200)
//     // .json(
//     //     new ApiResponse(200, likedVideo, "Succesfully fetched liked videos")
//     // );

// })

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id; // Assuming user ID is available in `req.user`.

    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID.");
    }

    // Check if the video exists
    const videoExists = await mongoose.model("Video").findById(videoId);
    if (!videoExists) {
        throw new ApiError(404, "Video not found.");
    }

    // Check if the user has already liked the video
    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // Unlike the video
        await existingLike.remove();
        return res.status(200).json(new ApiResponse(200, "Video unliked successfully."));
    } else {
        // Like the video
        const like = new Like({ video: videoId, likedBy: userId });
        await like.save();
        return res.status(201).json(new ApiResponse(201, "Video liked successfully."));
    }
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Validate comment ID
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID.");
    }

    // Check if the comment exists
    const commentExists = await mongoose.model("Comment").findById(commentId);
    if (!commentExists) {
        throw new ApiError(404, "Comment not found.");
    }

    // Check if the user has already liked the comment
    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        // Unlike the comment
        await existingLike.remove();
        return res.status(200).json(new ApiResponse(200, "Comment unliked successfully."));
    } else {
        // Like the comment
        const like = new Like({ comment: commentId, likedBy: userId });
        await like.save();
        return res.status(201).json(new ApiResponse(201, "Comment liked successfully."));
    }
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user.id;

    // Validate tweet ID
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID.");
    }

    // Check if the tweet exists
    const tweetExists = await mongoose.model("Tweet").findById(tweetId);
    if (!tweetExists) {
        throw new ApiError(404, "Tweet not found.");
    }

    // Check if the user has already liked the tweet
    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        // Unlike the tweet
        await existingLike.remove();
        return res.status(200).json(new ApiResponse(200, "Tweet unliked successfully."));
    } else {
        // Like the tweet
        const like = new Like({ tweet: tweetId, likedBy: userId });
        await like.save();
        return res.status(201).json(new ApiResponse(201, "Tweet liked successfully."));
    }
});


const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find all likes by the user on videos
    const likes = await Like.find({ likedBy: userId, video: { $exists: true } }).populate('video');

    // Extract video details
    const likedVideos = likes.map((like) => like.video);

    return res.status(200).json(new ApiResponse(200, "Liked videos retrieved successfully.", likedVideos));
});




export {
    // toggleLike,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}