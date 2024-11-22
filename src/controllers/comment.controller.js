import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    // const {videoId} = req.params
    // const {page = 1, limit = 10} = req.query

    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;

    let getAllComments;

    try {
        getAllComments = Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "details",
                    pipeline: [
                        {
                            $project: {
                                fullname: 1,
                                avatar: 1,
                                username: 1
                            }
                        }
                    ]
                }
            },
            // {
            //     $lookup: {
            //         from: "likes",
            //         localField: "owner",
            //         foreignField: "likedBy",
            //         as: "likes",
            //         pipeline: [
            //             {
            //                 $match: {
            //                     comment: {$exists: true}
            //                 }
            //             }
            //         ]
            //     }
            // },
            {
                $addFields: {
                    details: {
                        $first: "$details"
                    }
                }
            },
            // {
            //     $addFields: {
            //         likes: {$size: "$likes"}
            //     }
            // },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: parseInt(limit),
            },
        ]);
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while fetching Comments !!"
        );
    }


    const result = await Comment.aggregatePaginate(getAllComments, { page, limit });

    if (result.docs.length == 0) {
        return res.status(200).json(new ApiResponse(200, [], "No Comments Found"));
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, result.docs, "Comments fetched Succesfully !")
        );

})



const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}