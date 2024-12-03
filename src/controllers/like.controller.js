import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// final project code

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id; // Get the user ID from the authenticated user

    // Validate the video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if the user has already liked this video
    const existingLike = await Like.findOne(
        { 
            video: videoId, // The video field matches the videoId.
            likedBy: userId  // The likedBy field matches the userId.
                             // This query checks if a specific user (userId) has already liked a specific video (videoId).
        }
    );
    
    let message = '';
    let likesCount = 0;
    
    if (existingLike) {
        // If the like exists, remove the like
        await Like.findByIdAndDelete(existingLike._id);
        
        // Decrease the like count for the video
        await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: -1 } });
        
        message = "Like removed successfully";
    } else {
        // Otherwise, create a new like
        await Like.create({
            video: videoId,
            likedBy: userId, // Ensure likedBy is used correctly
        });
        
        // Increase the like count for the video
        await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: 1 } });
        
        message = "Liked successfully";
    }
    
    // Retrieve the updated video with the new like count
    const updatedVideo = await Video.findById(videoId);
    
    return res.status(200).json({
        success: true,
        message,
        totalLikes: updatedVideo.likesCount, // Include the updated like count
    });
});

const toggleCommentLike = asyncHandler(async (req,res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const commentExists = await Like.findOne(
        {
            comment: commentId,
            likedBy: userId
        }
    );

    let message = '';
    let likesCount = 0;

    if(commentExists) {
        await Like.findByIdAndDelete(commentExists._id);

        await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });

        message = "Like removed successfully";
    }else {
        await Like.create({
            comment: commentId,
            likedBy: userId
        });

        await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1} });

        message = "Liked successfully";
    }

    const updatedComment = await Comment.findById(commentId);

    return res
    .status(201)
    .json(
        {
            success: true,
            message,
            totalComment: updatedComment.likesCount,
        }
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400,"Invalid tweet ID")
    }

    const existingTweet = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: userId,
        }
    );

    let message = '';
    let likesCount = 0;

    if(existingTweet) {
        await Like.findByIdAndDelete(existingTweet._id);

        await Tweet.findByIdAndUpdate(tweetId, { $inc: { likesCount: -1 } });

        message = "Like removed successfully";
    }else{
        await Like.create({
            tweet: tweetId,
            likedBy: userId,
        });

        await Tweet.findByIdAndUpdate(tweetId, { $inc: { likesCount: 1 } });

        message = "Liked successfully";
    }

    const updatedTweet = await Tweet.findById(tweetId);

    return res 
    .status(200)
    .json({
        success: true,
        message,
        toggleTweetLike: updatedTweet.likesCount,
    })
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userID = req.user?._id;
  
    if (!isValidObjectId(userID)) {
        throw new ApiError(401, "Invalid userID");
    }
  
    const likedVideo = await Like.aggregate([
        {
            $match: {
                $and: [
                    {likedBy: new mongoose.Types.ObjectId(`${userID}`)},
                    {video: {$exists: true}}
                ]
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                details: {
                    $first: "$video"
                }
            }
        },
    ]);
  
    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideo, "Succesfully fetched liked videos")
        );
  })


export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
}