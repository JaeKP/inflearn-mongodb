import { Schema, model, Types } from "mongoose";

// 관계형 DB 만들기
const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },

    // 기본값 설정
    isLive: { type: Boolean, required: true, default: false },

    // 어떤 model과 관계가 있는지 ref를 통해 몽구스에게 알려준다.
    user: { type: Types.ObjectId, required: true, ref: "user" },
  },
  { timestamps: true }
);

const Blog = model("blog", BlogSchema);
export default Blog;
