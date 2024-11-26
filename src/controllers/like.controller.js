import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
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
            responce = await Like.create({
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

const toggleVideoLike = asyncHandler(async (req, res) => {
    // const {videoId} = req.params
    //TODO: toggle like on video

    const { videoId } = req.params
    
    const { isLiked , totalLikes} = await toggleLike(
        Video,
        videoId,
        req.user?._id
    )

    return res
    .status(201)
    .json(
        new ApiResponse
        (200,
             { totalLikes },
              !isLiked ? "Liked Successfully"
              : "Liked removed Successfully"
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleLike,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}