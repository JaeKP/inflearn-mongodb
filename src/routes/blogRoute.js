import { Router } from "express";
import { Blog, User } from "../models/index.js";
import { isValidObjectId } from "mongoose";

const blogRouter = Router();

blogRouter.post("/", async (req, res) => {
  try {
    const { title, content, isLive, userId } = req.body;
    // 유효성 검사
    if (typeof title !== "string") res.status(400).send({ error: "title is required" });
    if (typeof content !== "string") res.status(400).send({ error: "content is required" });
    if (isLive && typeof isLive !== "boolean") res.status(400).send({ error: "isLive must be a boolean" });
    if (!isValidObjectId(userId)) res.status(400).send({ error: "userId is invalid" });

    // 유저가 존재하는지 검사
    let user = await User.findById(userId);
    if (!user) res.status(400).send({ error: "user does not exist" });

    // blog 인스턴스에는 user 객체가 담겨져 있지만, db에 저장될 때는 알아서 id만 저장한다.
    let blog = new Blog({ ...req.body, user });
    await blog.save();
    return res.send({ blog });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

blogRouter.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({});
    return res.send({ blogs });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

blogRouter.get("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId)) res.status(400).send({ error: "blogId is invalid" });
    const blog = await Blog.findById(blogId);
    return res.send({ blog });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

blogRouter.put("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, content } = req.body;

    // 유효성 검사
    if (typeof title !== "string") res.status(400).send({ error: "title is required" });
    if (typeof content !== "string") res.status(400).send({ error: "content is required" });
    if (!isValidObjectId(blogId)) res.status(400).send({ error: "blogId is invalid" });

    // 수정
    const blog = await Blog.findOneAndUpdate({ _id: blogId }, { title, content }, { new: true });
    return res.send({ blog });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

// 부분적으로 수정할 떄는 put보다 patch를 사용한다.
blogRouter.patch("/:blogId/live", async (req, res) => {
  try {
    const { blogId } = req.params;
    const { isLive } = req.body;

    if (!isValidObjectId(blogId)) res.status(400).send({ error: "blogId is invalid" });
    if (typeof isLive !== "boolean") res.status(400).send({ error: "isLive must be boolean" });

    // 수정
    const blog = await Blog.findByIdAndUpdate(blogId, { isLive }, { new: true });
    return res.send({ blog });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

export default blogRouter;
