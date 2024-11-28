import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message

    return res
    .status(200)
    .json(
        new ApiResponse(200, "ok", "Health check is successfully !!")
    )
})

// const healthcheck = asyncHandler(async (req, res) => {
//     return res.status(200).json({
//         status: "OK",
//         message: "Service is running smoothly",
//         timestamp: new Date().toISOString(),
//     });
// });

export {
    healthcheck
}