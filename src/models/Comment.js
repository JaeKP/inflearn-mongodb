import { Schema, model, Types } from "mongoose";

export const CommentSchema = new Schema(
  {
    content: { type: String, required: true },
    user: {
      _id: { type: Types.ObjectId, required: true, ref: "user", index: true },
      username: { type: String, required: true },
      name: {
        first: { type: String, required: true },
        last: { type: String, required: true },
      },
    },
    blog: { type: Types.ObjectId, required: true, ref: "blog" },
  },
  { timestamps: true }
);

CommentSchema.index({ blog: 1, createAt: -1 });

const Comment = model("comment", CommentSchema);
export default Comment;
