import { Router } from "express";
import { Blog, User } from "../models/index.js";
import { isValidObjectId } from "mongoose";

const blogRouter = Router();

blogRouter.post("/", async (req, res) => {
  try {
    const { title, content, isLive, userId } = req.body;
    // 유효성 검사
    if (typeof title !== "string") return res.status(400).send({ error: "title is required" });
    if (typeof content !== "string") return res.status(400).send({ error: "content is required" });
    if (isLive && typeof isLive !== "boolean") return res.status(400).send({ error: "isLive must be a boolean" });
    if (!isValidObjectId(userId)) return res.status(400).send({ error: "userId is invalid" });

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

/** 
 * 
 * * 1. 데이터에 대한 요청을 client가 직접 함
 * * 단점: 과도한 요청
 * 
 * ! 성능
 *  ! blogsLimit 20 , comment limit 10 : 2~3초
 *  ! blogLimit 50, comment limit 10: 6초
 * 
  blogRouter.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find({}).limit(20);
    return res.send({ blogs });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});
 * 
 */

/**
 * * 2. populate 사용
 * * 단점: 참조한 데이터를 탐색하는데 시간이 걸린다.
 *  
 * ! 성능
 * ! blogsLimit 20 , comment limit 10 : 약 200ms
 * ! blogLimit 50, comment limit 10: 약 500ms
 * 
 * blogRouter.get("/", async (req, res) => {
  try {
    // 연결시킬 데이터를 populate를 사용하여 참조해준다.
    const blogs = await Blog.find({})
      .limit(1)
      .populate([{ path: "user" }, { path: "comments", populate: { path: "user" } }]);
    return res.send({ blogs });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});
 *
 */

blogRouter.get("/", async (req, res) => {
  try {
    // params로 page를 받아서 페이지네이션을 구현한다.
    let { page } = req.query;
    page = parseInt(page);

    // 업데이트 순으로 3개씩 페이징처리 하여 전달한다.
    const blogs = await Blog.find({})
      .sort({ updateAt: -1 })
      .skip(page * 3)
      .limit(3);
    return res.send({ blogs });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

blogRouter.get("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId)) return res.status(400).send({ error: "blogId is invalid" });
    const blog = await Blog.findById(blogId);

    const commentCount = await Comment.find({ blog: blogId }).countDocuments();

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
    if (typeof title !== "string") return res.status(400).send({ error: "title is required" });
    if (typeof content !== "string") return res.status(400).send({ error: "content is required" });
    if (!isValidObjectId(blogId)) return res.status(400).send({ error: "blogId is invalid" });

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

    if (!isValidObjectId(blogId)) return res.status(400).send({ error: "blogId is invalid" });
    if (typeof isLive !== "boolean") return res.status(400).send({ error: "isLive must be boolean" });

    // 수정
    const blog = await Blog.findByIdAndUpdate(blogId, { isLive }, { new: true });
    return res.send({ blog });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

export default blogRouter;
