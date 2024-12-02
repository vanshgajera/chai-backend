import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        likesCount: { type: Number, default: 0 }, // Initialize with 0
    },
    {timestamps: true}
)

export const Tweet = mongoose.model("Tweet", tweetSchema)