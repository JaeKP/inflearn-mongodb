import { Router } from "express";
import mongoose from "mongoose";
import { Blog, User, Comment } from "../models/index.js";
const userRouter = Router();

userRouter.get("/", async (req, res) => {
  try {
    // find: 탐색한 결과의 배열을 리턴한다.
    // findOne: 탐색한 결과 하나를 리턴한다.
    const users = await User.find({});
    return res.send({ users });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

userRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // userId가 ObjectId에 맞는 형식인지 유효성 검사
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({ error: "Invalid userId" });
    }

    const user = await User.findOne({ _id: userId });
    return res.send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

userRouter.post("/", async (req, res) => {
  try {
    // 유효성 검사
    let { username, name } = req.body;
    if (!username) return res.status(400).send({ error: "username is required" });
    if (!name || !name.first || !name.last)
      return res.status(400).send({ error: "Both first and last names are required" });

    const user = new User(req.body);

    // 데이터 저장
    await user.save();
    return res.send({ user });

    // 에러 처리
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

userRouter.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // userId가 ObjectId에 맞는 형식인지 유효성 검사
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({ error: "Invalid userId" });
    }

    // 삭제
    const [user] = await Promise.all([
      User.findOneAndDelete({ _id: userId }),
      Blog.deleteMany({ "user._id": userId }),

      // $pull: {제거할 데이터: {조건}}
      Blog.updateMany({ "comments.user._id": userId }, { $pull: { comments: { "user._id": userId } } }),
      Comment.deleteMany({ user: userId }),
    ]);

    return res.send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

userRouter.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // userId가 ObjectId에 맞는 형식인지 유효성 검사
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({ error: "Invalid userId" });
    }

    // 입력한 데이터 유효성 검사
    const { age, name } = req.body;
    if (!age && !name) return res.status(400).send({ error: "age or name is required" });
    if (age && typeof age !== "number") return res.status(400).send({ error: "age must be a number" });
    if (name && typeof name.first !== "string" && typeof name.last != "string")
      return res.status(400).send({ error: "must be string" });

    // 해당 id를 가진 데이터의 age를 수정한다.
    // let updateBody = {};
    // if(age) updateBody.age = age
    // if (name) updateBody.name = name
    // const user = await User.findByIdAndUpdate(userId, updateBody, { new: true });

    let user = await User.findById(userId);
    if (age) user.ane = age;

    // user의 이름이 변경되면 블로그, 댓글에 대한 데이터도 변경해야 한다.
    if (name) {
      user.name = name;

      await Promise.all([
        // updateMany: 다수의 도큐먼트를 수정한다.
        Blog.updateMany({ "user._id": userId }, { "user.name": name }),

        // array filter를 사용하여 해당 유저가 작성한 모든 코멘트를 수정한다.
        // 하나의 도큐먼트에서 여러개의 데이터를 수정해야 할때, array filter를 사용하여 조건을 명시한다.
        await Blog.updateMany(
          {},
          { "comments.$[elem].user.name": name },
          { arrayFilters: [{ "elem.user._id": userId }] }
        ),
      ]);
    }
    await user.save();
    return res.send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

export default userRouter;
