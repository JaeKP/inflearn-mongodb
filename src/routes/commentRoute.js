import { Router } from "express";
import { User, Blog, Comment } from "../models/index.js";
import { isValidObjectId } from "mongoose";

// blogId를 params에서 불러오기 위해 mergeParams를 true로 설정해야 한다.
const commentRouter = Router({ mergeParams: true });

commentRouter.post("/", async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, userId } = req.body;

    // 유효성 검사
    if (!isValidObjectId(blogId)) return res.status(400).send({ error: "blogId is invalid" });
    if (!isValidObjectId(userId)) return res.status(400).send({ error: "userId is invalid" });
    if (typeof content !== "string") return res.status(400).send({ error: "content is required" });

    // 순차적으로 데이터를 불러올 필요는 없다.
    // 동시에 데이터를 불러오는 것이 더 빠르다.
    const [blog, user] = await Promise.all([Blog.findById(blogId), User.findById(userId)]);

    // 유효성 검사
    if (!blog || !user) return res.status(400).send({ error: "blog or user does not exist" });
    if (!blog.isLive) return res.status(400).send({ error: "blog is not available" });

    // 저장
    const comment = new Comment({ content, user, blog });
    await comment.save();
    return res.send({ comment });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

commentRouter.get("/", async (req, res) => {
  const { blogId } = req.params;
  if (!isValidObjectId(blogId)) return res.status(400).send({ error: "blogId is invalid" });

  const comments = await Comment.find({ blog: blogId });
  return res.send({ comments });
});

export default commentRouter;
