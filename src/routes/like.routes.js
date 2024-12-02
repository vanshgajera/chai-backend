import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    // toggleVideoLikeNew
    // toggleLike,
    

} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// router.route("/likes/toggle/v/:videoId").post(toggleLike);
// router.route("/toggle/videos/:videoId/like").patch(toggleVideoLike);
router.route("/videos/:videoId/like").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);


// router.route("/toggle/v/:videoId/toggle-like").post(toggleVideoLikeNew);




export default router