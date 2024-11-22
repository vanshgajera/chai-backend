import mongoose, { isValidObjectId } from "mongoose"
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


    const totalComments = await Comment.aggregatePaginate(getAllComments, { page, limit });

    if (totalComments.docs.length == 0) {
        return res.status(200).json(new ApiResponse(200, [], "No Comments Found"));
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, totalComments.docs, "Comments fetched Succesfully !")
        );

})



const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { videoId } = req.params

    const { content } = req.body

    if(!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid videoID")
    }

    const newComment = await Comment.create(
        {
            content,
            video: videoId,
            owner: req.user?._id
        }
    )

    if(!newComment) {
        throw new ApiError(400, "Something went wrong while adding comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, newComment, "Successfully added comment")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    // const { commentId } = req.params
    const { commentId } = req.params    
    const { content } = req.body
    
    if(content?.trim() === "") {
        throw new ApiError(400, "Empty comment not allowed")
    }

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentID")
    }

    const newcomment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content
        },
        {
            new: true
        }
    )

    if(!newcomment) {
        throw new ApiError(400, "Something went wrong while updating comment")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200,newcomment, "Successfully Updated Comment")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentID")
    }

    const delcomment = await Comment.findByIdAndDelete(commentId)

    if(!delcomment) {
        throw new ApiError(400, "Something went wrong while Deleting comment")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, delcomment, "Succesfully deleted comment")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}