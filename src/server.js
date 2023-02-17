import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { userRouter, blogRouter, commentRouter } from "./routes/index.js";
import generateFakeData from "../faker2.js";

dotenv.config();
const PASSWORD = process.env.PASSWORD;

const app = express();
app.use(express.json());

// mongodb compass connect uri
const MONGO_URI = `mongodb+srv://admin:${PASSWORD}@mongodbtutorial.5pazsio.mongodb.net/BlogService?retryWrites=true&w=majority`;

const server = async () => {
  try {
    mongoose.set("strictQuery", false);
    let mongodbConnection = await mongoose.connect(MONGO_URI);

    // 디버깅
    // mongoose.set("debug", true);

    console.log("MongoDB connected");

    // json을 객체로 파싱하는 미들웨어
    app.use(express.json());

    app.use("/user", userRouter);
    app.use("/blog", blogRouter);

    // comment는 특정 블로그의 후기를 불러오는 개념이기 때문에 자식 개념이기 떄문에 uri를 다음과 같이 한다.
    app.use("/blog/:blogId/comment", commentRouter);

    // 클라이언트가 3000포트로 접속할 수 있다. (node Server)
    app.listen(3000, async () => {
      console.log("server start: http://localhost:3000/");

      // 가상 데이터 생성
      // for (let i = 0; i < 20; i++) {
      //   await generateFakeData(10, 10, 10);
      // }
      // await generateFakeData(1000000, 5, 20);
    });
  } catch (error) {
    console.log(error);
  }
};

server();
