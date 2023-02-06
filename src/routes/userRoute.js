import { Router } from "express";
import mongoose from "mongoose";
import { User } from "../models/index.js";
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
    const user = await User.findOneAndDelete({ _id: userId });
    return res.send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

userRouter.put("/user/:userId", async (req, res) => {
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
    if (name) user.name = name;
    await user.save();
    return res.send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

export default userRouter;
