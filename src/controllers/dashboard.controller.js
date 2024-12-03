import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

     // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user._id;

    const response = await User.aggregate([
        // Match the current user
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId),
            },
        },
        // Fetch basic user details
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
            },
        },
        // Fetch video stats
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videoStats",
            },
        },
        {
            $addFields: {
                totalVideos: { $size: "$videoStats" }, // Count total videos
                totalViews: {
                    $sum: "$videoStats.views", // Sum all video views
                },
                totalLikes: {
                    $sum: "$videoStats.likesCount", // Sum all video likes
                },
            },
        },
        // Fetch subscription stats (total subscribers)
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscriptionStats",
            },
        },
        {
            $addFields: {
                totalSubscribers: { $size: "$subscriptionStats" }, // Count total subscribers
            },
        },
        // Format the output
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                stats: {
                    totalVideos: "$totalVideos",
                    totalViews: "$totalViews",
                    totalLikes: "$totalLikes",
                    totalSubscribers: "$totalSubscribers",
                },
            },
        },
    ]);

    if (!response || response.length === 0) {
        throw new ApiError(
            500,
            "Something went wrong while fetching channel statistics!"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, response[0], "Fetched channel statistics!"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const userId = req.user._id;

    const responce = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "likes",
                localField:"_id",
                foreignField:"video",
                as: "likes",
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                ispublished: 1,
                createdAt: 1,
                owner: 1,
                description: 1,
                likes: {
                    $size: "$likes"
                }
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: "$likes" },
                videos: {
                    $push: {
                      _id: "$_id",
                      videoFile: "$videoFile",
                      thumbnail: "$thumbnail",
                      title: "$title",
                      isPublished: "$isPublished",
                      createdAt: "$createdAt",
                      owner: "$owner",
                      likes: "$likes",
                      description: "$description"
                    }
                }
            }
        }
    ])

    if(!responce) {
        throw new ApiError(407, "Something went wrong while getting videos in dashboard !")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                responce,
                "Succesfullt fetched videos and likes."
            )
        );
})

export {
    getChannelStats, 
    getChannelVideos
}