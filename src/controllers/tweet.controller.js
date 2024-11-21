import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body

    if(!content || content.trim().length === 0) {
        throw new ApiError(400, "Content is missing")
    }

    const tweet = await Tweet.create({
        content,
        owner: mongoose.Types.ObjectId(req.user?._id),
    })

    return res
    .status(201)
    .json(new ApiResponse(200, {tweet}, "Tweet uploaded succesfully."))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    // const userId = req.user._id;
    const userId = req.user
    
    try {

        if(!userId) {
            throw new ApiError(400, "User ID is required")
        }

        const userTweets = await Tweet.aggregate([
            {
                $match: {
                    owner : mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                username: 1,
                                avatar: 1,
                            }
                        }
                    ]
                }
            },
            {
              $addFields: {
                owner: {
                    $first: "$owner"
                }
              }  
            }
        ])

        if(!userTweets || userTweets.length === 0) {
            new ApiError(404, "No tweets found for this user")
        }

        return res
        .status(200)
        .json(new ApiResponse (200, userTweets, "Tweets fetched succesfully !!"))

    } catch (error) {
        throw new ApiError(500, error.message, "Internal Server Error")
    }  
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { content } = req.body
    const { tweetId } = req.params

    // Debugging
    // console.log("req.params:", req.params); // Check if tweetID exists
    // console.log("tweetID:", tweetId); // Check tweetID value
    // console.log("req.body:", req.body); // Check if content is provided
    

    if(content?.trim() === "") {
        throw new ApiError(400, "Content is missing")
    }

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID.");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            },
        },
        {
            new: true
        }
    )

    if(!tweet) {
        throw new ApiError(404, "tweet is not found")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, tweet, "Tweet updated succesfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params

    if(!tweetId) {
        throw new ApiError(401, "Invalid tweetID")
    }

    const Deltweet = await Tweet.findByIdAndDelete(tweetId)

    if(!Deltweet) {
        throw new ApiError(500, "Something went wrong while deleting Tweet")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, Deltweet, "Tweet deleted successfully "))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}