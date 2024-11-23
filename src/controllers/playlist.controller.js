import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    // const {name, description} = req.body
    //TODO: create playlist

    const {name, description} = req.body

    if(!name || !description) {
        throw new ApiError(401, "Both field are required")
    }

    const newPlaylist = await Playlist.create(
        {
            name,
            description,
            owner: new mongoose.Types.ObjectId(`${req.user?._id}`)
        }
    )

    if(!newPlaylist) {
        throw new ApiError(500, "Something went wrong while making playlist")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, newPlaylist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    // const {userId} = req.params
    //TODO: get user playlists

    const {userId} = req.params

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userID")
    }

    const userplaylist = await Playlist.aggregate([
        {
            $match: {
                owner : new mongoose.Types.ObjectId(`${userId}`)
            }
        },
        {
           $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "details",
                pipeline: [
                    {
                        $project: {
                            thumbnail: 1
                        }
                    }
                ]
           }
        }
    ])

    return res
    .status(201)
    .json(
        userplaylist.length?
        new ApiResponse(200, userplaylist, "User playlist data fetched successfully")
        :
        new ApiResponse(200, userplaylist, "No playlist found")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    // const {playlistId} = req.params
    //TODO: get playlist by id

    const { playlistId } = req.params

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(401,"Invalid playlistID")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id : new mongoose.Types.ObjectId(`${playlistId}`)
            }
        },
        {
            $lookup: {
                from: "vi"
            }
        }
    ])
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}