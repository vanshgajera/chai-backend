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
    const userId = req.user.id;

    // Find all likes on videos by the user
    const likes = await Like.find({ likedBy: userId, video: { $exists: true } })
        .populate("video") // Populate video details
        .exec();

    const likedVideos = likes.map((like) => like.video); // Extract video details
    return res.status(200).json(new ApiResponse(200, "Liked videos retrieved successfully.", likedVideos));
});




export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
}