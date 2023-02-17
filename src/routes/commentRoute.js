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
    // 재참조를 막기 위해 blog: blogId로 저장해야 함을 잊지 말자!
    // 아래서 블로그에 comment를 추가하기 때문에 재참조가 발생한다.
    const comment = new Comment({ content, user, blog: blogId });

    // Comment는 Blog 모델에 내장되어있기떄문에 데이터를 업데이트해야 한다.
    // Blog의 comments 필드에 comment를 추가한다.
    //  await Promise.all([comment.save(), Blog.updateOne({ _id: blogId }, { $push: { comments: comment } })]);

    // Comment는 Blog 모델에 내장되어있기떄문에 데이터를 업데이트해야 한다.
    // blogDB에 저장된 commentCount를 1증가시킨다.
    // await Promise.all([comment.save(), Blog.updateOne({ _id: blogId }, { $inc: { commentCount: 1 } })]);

    // Comment는 Blog 모델에 내장되어있기떄문에 데이터를 업데이트해야 한다.
    // blogDB에 저장된 commentCount를 1증가시키고 최근 코멘트를 업데이트 한다.
    // 만약 blogDB에 저장된 코멘트가 3개 초과이면 가장 오래된 코멘트를 삭제한다.
    blog.commentCount++;
    blog.comments.push(comment);
    if (blog.commentCount > 3) blog.comments.shift();

    await Promise.all([comment.save(), blog.save()]);

    return res.send({ comment });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

commentRouter.get("/", async (req, res) => {
  let { page = 0 } = req.query;
  page = parseInt(page);
  const { blogId } = req.params;
  if (!isValidObjectId(blogId)) return res.status(400).send({ error: "blogId is invalid" });

  // 페이지네이션
  const comments = await Comment.find({ blog: blogId })
    .sort({ createAt: -1 })
    .skip(page * 3)
    .limit(3);
  return res.send({ comments });
});

commentRouter.patch("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (typeof content !== "string") {
    return res.status(400).send({ error: "content is required" });
  }

  // comments 배열안에 _id의 값이 comment._id와 동일한 것을 찾아서 수정한다.
  const [comment] = await Promise.all([
    Comment.findOneAndUpdate({ _id: commentId }, { content }, { new: true }),

    // $를 사용하면 filter를 통해 선택된 도큐먼트를 가리킨다.
    // 원래는 comments[index].content = value로 저장해야 하지만 index를 모르기 때문에 $를 사용하는 것이다.
    // 즉, comments.$는 comments._id가 comment_id인 comment를 의미한다.
    await Blog.updateOne({ "comments._id": commentId }, { "comments.$.content": content }),
  ]);

  return res.send({ comment });
});

commentRouter.delete("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findOneAndDelete({ _id: commentId });
  await Blog.updateOne({ "comments._id": commentId }, { $pull: { comments: { _id: commentId } } });

  return res.send({ comment });
});

export default commentRouter;
