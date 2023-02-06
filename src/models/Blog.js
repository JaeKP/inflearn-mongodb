import { Schema, model, Types } from "mongoose";
import { CommentSchema } from "./Comment.js";

// 관계형 DB 만들기
const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },

    // 기본값 설정
    isLive: { type: Boolean, required: true, default: true },

    // 1. DB를 연결시킨다.
    // 어떤 model과 관계가 있는지 ref를 통해 몽구스에게 알려준다.
    // user: { type: Types.ObjectId, required: true, ref: "user" },

    // 2. 필요한 model을 내장시킨다.
    user: {
      _id: { type: Types.ObjectId, required: true, ref: "user" },

      // 여기에는 unique: true 속성을 주면 안된다. (여러 유저가 작성할 수 있기 떄문)
      username: { type: String, required: true },
      name: {
        first: { type: String, required: true },
        last: { type: String, required: true },
      },
    },

    comments: [CommentSchema],
  },
  { timestamps: true }
);

// 1. 가상의 key를 만든다.
// BlogSchema.virtual("comments", {
//   ref: "comment", // 어떤 모델인가
//   localField: "_id", // 참고해야 하는 필드는 무엇인가
//   foreignField: "blog", // 어떻게 연결되어있는가
// });

// BlogSchema.set("toObject", { virtuals: true });
// BlogSchema.set("toJSON", { virtuals: true });

const Blog = model("blog", BlogSchema);
export default Blog;
