import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleLike = async (Model, resourceID, userID) => {

    if(!isValidObjectId(resourceID) || !isValidObjectId(userID)) {
        throw new ApiError("Invalid  ResourceID or UserID")
    }

    const model = Model.modelName;

    const isLiked = await Like.findOne({
        [model.toLowerCase()]: resourceID,
        LikedBy: userID,
    });

    let responce;
    try {
        if(!isLiked){
            responce = await Like.create({
                [model.toLowerCase()]: resourceID,
                LikedBy: userID,
            })
        }else{
            responce = await Like.deleteOne({
                [model.toLowerCase()]: resourceID,
                LikedBy: userID,
            });
        }
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || "Something went wrong in ToggleLike"
        )
    }

    const totalLikes = await Like.countDocuments({
        [model.toLowerCase()]: resourceID
    })

    return { responce, isLiked, totalLikes }
}

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

const toggleVideoLike = asyncHandler(async (req, res) => {
    // const { videoId } = req.params;

    // // Validate the video ID
    // if (!isValidObjectId(videoId)) {
    //     throw new ApiError(400, "Invalid Video ID");
    // }

    // try {
    //     // Call the generic toggleLike function for the Video model
    //     const { isLiked } = await toggleLike(
    //         Video,           // Pass the Video model
    //         videoId,         // The video ID from params
    //         req.user._id     // The logged-in user's ID from req.user
    //     );

    //     // Increment or decrement the likesCount
    //     const updatedVideo = await Video.findByIdAndUpdate(
    //         videoId,
    //         { $inc: { likesCount: isLiked ? -1 : 1 } }, // Increment or decrement likesCount
    //         { new: true } // Return the updated document
    //     );

    //     // Respond with the appropriate message and updated likesCount
    //     return res.status(200).json(
    //         new ApiResponse(
    //             200,
    //             { totalLikes: updatedVideo.likesCount },
    //             isLiked
    //                 ? "Like removed successfully"
    //                 : "Liked successfully"
    //         )
    //     );
    // } catch (error) {
    //     throw new ApiError(500, error.message || "Error toggling video like");
    // }
});



const toggleCommentLike = asyncHandler(async (req, res) => {
    // // const {commentId} = req.params
    // //TODO: toggle like on comment

    // const { commentId } = req.params

    // const { responce, isLiked, totalLikes} = await toggleLike(
    //     Comment,
    //     commentId,
    //     req.user?._id
    // )
    

    // return res
    // .status(201)
    // .json(
    //     new ApiResponse(
    //         200,
    //         {totalLikes},
    //         isLiked ? "Liked Successfully"
    //         : "Liked removed Successfully"
    //      )
    // )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    // // const {tweetId} = req.params
    // //TODO: toggle like on tweet

    // const { tweetId } = req.params

    // const { responce, isLiked, totalLikes } = await toggleLike(
    //     Tweet,
    //     tweetId,
    //     req.user?._id
    // )

    // return res
    // .status(201)
    // .json(
    //     new ApiResponse(
    //         200,
    //         {responce},
    //         { totalLikes },
    //         !isLiked
    //                 ? "Liked Successfully"
    //                 : "Liked removed Successfully"
    //     )
    // )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    // //TODO: get all liked videos

    // const userID = req.user?._id

    // if(!isValidObjectId(userID)) {
    //     throw new ApiError(401, "Invalid userID")
    // }

    // const likedVideo = await Like.aggregate([
    //     {
    //         $match: {
    //             $and: [
    //                 {LikedBy: new mongoose.Types.ObjectId(`${userID}`)},
    //                 {video: {$exists: true}}
    //             ]
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "videos",
    //             localField: "video",
    //             foreignField: "_id",
    //             as: "video",
    //             pipeline: [
    //                 {
    //                     $lookup: {
    //                         from: "users",
    //                         localField: "owner",
    //                         foreignField: "_id",
    //                         as: "owner",
    //                         pipeline: [
    //                             {
    //                                 $project: {
    //                                     fullName: 1,
    //                                     username: 1,
    //                                     avatar: 1,
    //                                 }
    //                             }
    //                         ]
    //                     }
    //                 },
    //                 {
    //                     $addFields: {
    //                         owner: {
    //                             $first: "$owner",
    //                         }
    //                     }
    //                 }
    //             ]
    //         }
    //     },
    //     {
    //         $addFields: {
    //             details: {
    //                 $first: "$video"
    //             }
    //         }
    //     }
    // ]);

    // return res
    // .status(200)
    // .json(
    //     new ApiResponse(200, likedVideo, "Succesfully fetched liked videos")
    // );

})



export {
    toggleLike,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}