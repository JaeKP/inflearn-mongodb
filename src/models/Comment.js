import { Schema, model, Types } from "mongoose";

export const CommentSchema = new Schema(
  {
    content: { type: String, required: true },
    user: {
      _id: { type: Types.ObjectId, required: true, ref: "user" },
      username: { type: String, required: true },
    },
    blog: { type: Types.ObjectId, required: true, ref: "blog" },
  },
  { timestamps: true }
);

const Comment = model("comment", CommentSchema);
export default Comment;
