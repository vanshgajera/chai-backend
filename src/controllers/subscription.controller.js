import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // const {channelId} = req.params
    // TODO: toggle subscription

     const {channelId} = req.params
     const { sub } = req.query // Check the query parameter for subscription action
                                // If sub === "true", the user will unsubscribe.
                                // If sub !== "true", the user will subscribe.

     if(!channelId) {
        throw new ApiError(500, "channelId is required")
     }

     if(sub === "true") {
        await Subscription.deleteOne(
            {
                channel: channelId,
                subscriber: req.user?._id
            }
        )
     }
     else{
        await Subscription.create(
            {
                subscriber: req.user?._id,
                channel: channelId
            }
        )
        console.log(Subscription);
     }

     

     return res
     .status(201)
    .json(new ApiResponse(200, {}, "Subscription toggle successfully"))
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}